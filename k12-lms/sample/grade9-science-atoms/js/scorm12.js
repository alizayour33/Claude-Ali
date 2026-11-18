/* Minimal SCORM 1.2 wrapper. Finds the LMS API in parent frames / opener and
 * degrades gracefully (offline preview) when no LMS is present. */
(function (global) {
  'use strict';
  var api = null;
  var startedAt = Date.now();
  var active = false;

  function find(win) {
    var tries = 0;
    while (win && !win.API && win.parent && win.parent !== win && tries < 10) { win = win.parent; tries++; }
    return win && win.API ? win.API : null;
  }
  function getAPI() {
    if (api) return api;
    try { api = find(window); } catch (e) { api = null; }
    if (!api) { try { api = window.opener ? find(window.opener) : null; } catch (e) { api = null; } }
    return api;
  }
  function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }
  function sessionTime() {
    var s = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
    return pad(Math.floor(s / 3600), 4) + ':' + pad(Math.floor(s / 60) % 60, 2) + ':' + pad(s % 60, 2);
  }

  var SCORM = {
    connected: false,
    init: function () {
      var a = getAPI();
      if (!a) { SCORM.connected = false; return false; }
      active = String(a.LMSInitialize('')) === 'true';
      SCORM.connected = active;
      if (active) {
        var st = SCORM.get('cmi.core.lesson_status');
        if (st === 'not attempted' || st === '') SCORM.set('cmi.core.lesson_status', 'incomplete');
        SCORM.commit();
      }
      return active;
    },
    get: function (k) { return active ? String(getAPI().LMSGetValue(k)) : ''; },
    set: function (k, v) { return active ? String(getAPI().LMSSetValue(k, String(v))) === 'true' : false; },
    commit: function () { return active ? String(getAPI().LMSCommit('')) === 'true' : false; },
    finish: function () {
      if (!active) return false;
      SCORM.set('cmi.core.session_time', sessionTime());
      SCORM.commit();
      var ok = String(getAPI().LMSFinish('')) === 'true';
      active = false;
      return ok;
    }
  };
  global.SCORM = SCORM;
})(window);
