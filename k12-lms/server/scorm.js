'use strict';
// SCORM package helpers: unzip safely, read imsmanifest.xml, find the launch file.
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

/** Decode the handful of XML entities that appear in manifest attributes/titles. */
function decodeXml(s) {
  return String(s)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function attr(tag, name) {
  const m = new RegExp(`(?:^|\\s)${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i').exec(tag);
  return m ? decodeXml(m[2] ?? m[3]) : null;
}

/** Strip a namespace prefix from tag names so <imscp:resource> and <resource> match alike. */
function stripPrefixes(xml) {
  return xml.replace(/<(\/?)[A-Za-z_][\w.-]*:/g, '<$1');
}

/**
 * Parse imsmanifest.xml (SCORM 1.2 or 2004) and return
 * { version, title, launch, organizations, resources }.
 * A small purpose-built parser: manifests are flat enough that a full XML library is not needed.
 */
function parseManifest(rawXml) {
  const xml = stripPrefixes(rawXml.replace(/<!--[\s\S]*?-->/g, ''));

  const schemaVersion = (/<schemaversion>\s*([^<]+?)\s*<\/schemaversion>/i.exec(xml) || [])[1] || '';
  let version = '1.2';
  if (/2004|CAM\s*1\.3/i.test(schemaVersion) || /adlcp_v1p3|imsss/i.test(rawXml)) version = '2004';

  const manifestTag = (/<manifest\b[^>]*>/i.exec(xml) || [''])[0];
  const manifestBase = attr(manifestTag, 'xml:base') || '';

  // Resources
  const resources = {};
  const resourcesBlock = /<resources\b([^>]*)>([\s\S]*?)<\/resources>/i.exec(xml);
  const resourcesBase = resourcesBlock ? attr(resourcesBlock[1], 'xml:base') || '' : '';
  const resRe = /<resource\b([^>]*?)(\/>|>([\s\S]*?)<\/resource>)/gi;
  let m;
  while ((m = resRe.exec(resourcesBlock ? resourcesBlock[2] : xml))) {
    const tag = m[1];
    const id = attr(tag, 'identifier');
    if (!id) continue;
    resources[id] = {
      id,
      href: attr(tag, 'href'),
      base: attr(tag, 'xml:base') || '',
      scormType: (attr(tag, 'adlcp:scormtype') || attr(tag, 'adlcp:scormType') ||
                  attr(tag, 'scormtype') || attr(tag, 'scormType') || '').toLowerCase(),
    };
  }

  // Organizations (default first) and their items
  const orgsTag = (/<organizations\b[^>]*>/i.exec(xml) || [''])[0];
  const defaultOrg = attr(orgsTag, 'default');
  const organizations = [];
  const orgRe = /<organization\b([^>]*)>([\s\S]*?)<\/organization>/gi;
  while ((m = orgRe.exec(xml))) {
    const body = m[2];
    const items = [];
    const itemRe = /<item\b([^>]*?)(\/>|>)/gi;
    let it;
    while ((it = itemRe.exec(body))) {
      const ref = attr(it[1], 'identifierref');
      if (!ref) continue;
      // Title is the first <title> after this <item ...>
      const after = body.slice(it.index + it[0].length);
      const t = /^\s*<title>([\s\S]*?)<\/title>/i.exec(after);
      items.push({
        identifier: attr(it[1], 'identifier'),
        identifierref: ref,
        parameters: attr(it[1], 'parameters') || '',
        title: t ? decodeXml(t[1].trim()) : '',
      });
    }
    const orgTitle = (/<title>([\s\S]*?)<\/title>/i.exec(body) || [])[1];
    organizations.push({ identifier: attr(m[1], 'identifier'), title: orgTitle ? decodeXml(orgTitle.trim()) : '', items });
  }
  organizations.sort((a, b) => (b.identifier === defaultOrg) - (a.identifier === defaultOrg));

  const org = organizations[0];
  let launch = null;
  let title = org?.title || '';
  for (const item of org?.items || []) {
    const r = resources[item.identifierref];
    if (r && r.href) {
      launch = joinUrl(manifestBase, resourcesBase, r.base, r.href) + (item.parameters || '');
      if (!title) title = item.title;
      break;
    }
  }
  if (!launch) {
    const sco = Object.values(resources).find((r) => r.href && r.scormType === 'sco') ||
                Object.values(resources).find((r) => r.href);
    if (sco) launch = joinUrl(manifestBase, resourcesBase, sco.base, sco.href);
  }
  return { version, title, launch, organizations, resources: Object.values(resources) };
}

function joinUrl(...parts) {
  return parts.filter(Boolean).map((p, i) => (i === 0 ? p : p.replace(/^\/+/, ''))).reduce((acc, p) => {
    if (!acc) return p;
    return acc.endsWith('/') ? acc + p : acc + '/' + p;
  }, '').replace(/^\.\//, '');
}

/** Extract a SCORM zip into destDir, refusing any entry that would escape the folder. */
function extractPackage(zipBuffer, destDir) {
  const zip = new AdmZip(zipBuffer);
  const root = path.resolve(destDir);
  fs.mkdirSync(root, { recursive: true });
  for (const entry of zip.getEntries()) {
    const name = entry.entryName.replace(/\\/g, '/');
    const target = path.resolve(root, name);
    if (target !== root && !target.startsWith(root + path.sep)) {
      throw Object.assign(new Error(`Unsafe path in zip: ${name}`), { status: 400 });
    }
    if (entry.isDirectory) { fs.mkdirSync(target, { recursive: true }); continue; }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, entry.getData());
  }
  return root;
}

/** Locate imsmanifest.xml (root, or one folder down when the zip wraps everything in a folder). */
function findManifest(dir) {
  const direct = path.join(dir, 'imsmanifest.xml');
  if (fs.existsSync(direct)) return { manifestPath: direct, baseDir: '' };
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name, 'imsmanifest.xml');
    if (fs.existsSync(p)) return { manifestPath: p, baseDir: name };
  }
  return null;
}

/** Unzip + inspect. Returns { version, title, launch } with launch relative to the extract dir. */
function importPackage(zipBuffer, destDir) {
  extractPackage(zipBuffer, destDir);
  const found = findManifest(destDir);
  if (!found) {
    throw Object.assign(new Error('Not a SCORM package: imsmanifest.xml was not found in the zip.'), { status: 400 });
  }
  const info = parseManifest(fs.readFileSync(found.manifestPath, 'utf8'));
  if (!info.launch) {
    throw Object.assign(new Error('The manifest does not point to a launch page (no resource with an href).'), { status: 400 });
  }
  const launch = found.baseDir ? `${found.baseDir}/${info.launch}` : info.launch;
  const launchFile = path.resolve(destDir, launch.split(/[?#]/)[0]);
  if (!launchFile.startsWith(path.resolve(destDir)) || !fs.existsSync(launchFile)) {
    throw Object.assign(new Error(`Launch file "${launch}" listed in the manifest is missing from the zip.`), { status: 400 });
  }
  return { version: info.version, title: info.title, launch };
}

module.exports = { parseManifest, importPackage, extractPackage };
