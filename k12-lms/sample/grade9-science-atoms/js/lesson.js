(function () {
  'use strict';

  // ---------- Data ----------
  // [Z, symbol, name, period, group, category, standard atomic weight, neutrons in most common isotope]
  var ELEMENTS = [
    [1, 'H', 'Hydrogen', 1, 1, 'nonmetal', 1.008, 0], [2, 'He', 'Helium', 1, 18, 'noble', 4.003, 2],
    [3, 'Li', 'Lithium', 2, 1, 'alkali', 6.94, 4], [4, 'Be', 'Beryllium', 2, 2, 'alkaline', 9.012, 5],
    [5, 'B', 'Boron', 2, 13, 'metalloid', 10.81, 6], [6, 'C', 'Carbon', 2, 14, 'nonmetal', 12.011, 6],
    [7, 'N', 'Nitrogen', 2, 15, 'nonmetal', 14.007, 7], [8, 'O', 'Oxygen', 2, 16, 'nonmetal', 15.999, 8],
    [9, 'F', 'Fluorine', 2, 17, 'halogen', 18.998, 10], [10, 'Ne', 'Neon', 2, 18, 'noble', 20.180, 10],
    [11, 'Na', 'Sodium', 3, 1, 'alkali', 22.990, 12], [12, 'Mg', 'Magnesium', 3, 2, 'alkaline', 24.305, 12],
    [13, 'Al', 'Aluminium', 3, 13, 'metal', 26.982, 14], [14, 'Si', 'Silicon', 3, 14, 'metalloid', 28.085, 14],
    [15, 'P', 'Phosphorus', 3, 15, 'nonmetal', 30.974, 16], [16, 'S', 'Sulfur', 3, 16, 'nonmetal', 32.06, 16],
    [17, 'Cl', 'Chlorine', 3, 17, 'halogen', 35.45, 18], [18, 'Ar', 'Argon', 3, 18, 'noble', 39.948, 22],
    [19, 'K', 'Potassium', 4, 1, 'alkali', 39.098, 20], [20, 'Ca', 'Calcium', 4, 2, 'alkaline', 40.078, 20]
  ];
  var CATEGORY = { alkali: 'Alkali metal', alkaline: 'Alkaline earth metal', metal: 'Other metal', metalloid: 'Metalloid',
    nonmetal: 'Nonmetal', halogen: 'Halogen', noble: 'Noble gas' };

  var QUESTIONS = [
    { id: 'q1_proton_charge', text: 'Which subatomic particle has a positive charge?',
      options: ['Electron', 'Proton', 'Neutron', 'Nucleus'], answer: 1 },
    { id: 'q2_atomic_number', text: 'The atomic number of an element tells you the number of…',
      options: ['neutrons', 'protons + neutrons', 'protons', 'electron shells'], answer: 2 },
    { id: 'q3_mass_number', text: 'An atom has 17 protons and 18 neutrons. What is its mass number?',
      options: ['17', '18', '35', '1'], answer: 2 },
    { id: 'q4_isotopes', text: 'Carbon-12 and carbon-14 are…',
      options: ['different elements', 'isotopes of the same element', 'ions with different charges', 'compounds'], answer: 1 },
    { id: 'q5_groups', text: 'Elements in the same group (column) of the periodic table have the same number of…',
      options: ['valence electrons', 'neutrons', 'electron shells', 'total electrons'], answer: 0 },
    { id: 'q6_oxygen_shells', text: 'What is the electron arrangement of a neutral oxygen atom (8 electrons)?',
      options: ['2, 6', '8', '2, 8', '4, 4'], answer: 0 }
  ];
  var PASS = 70;

  // ---------- State & SCORM ----------
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var state = { slide: 0, seen: [0], answers: {}, passed: false, best: null };

  SCORM.init();
  try {
    var saved = SCORM.get('cmi.suspend_data');
    if (saved) state = Object.assign(state, JSON.parse(saved));
    var loc = parseInt(SCORM.get('cmi.core.lesson_location'), 10);
    if (!isNaN(loc)) state.slide = loc;
  } catch (e) { /* ignore corrupt suspend data */ }

  function persist() {
    SCORM.set('cmi.core.lesson_location', state.slide);
    SCORM.set('cmi.suspend_data', JSON.stringify(state));
    SCORM.commit();
  }

  // ---------- Navigation ----------
  var bar = document.getElementById('bar');
  var count = document.getElementById('count');
  var prev = document.getElementById('prev');
  var next = document.getElementById('next');
  var titleEl = document.getElementById('slideTitle');

  function show(i) {
    state.slide = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach(function (s, k) { s.classList.toggle('active', k === state.slide); });
    if (state.seen.indexOf(state.slide) < 0) state.seen.push(state.slide);
    bar.style.width = ((state.slide + 1) / slides.length * 100) + '%';
    count.textContent = (state.slide + 1) + ' / ' + slides.length;
    titleEl.textContent = slides[state.slide].getAttribute('data-title');
    prev.disabled = state.slide === 0;
    next.textContent = state.slide === slides.length - 1 ? 'Finish ✓' : 'Next →';
    window.scrollTo(0, 0);
    if (state.slide === slides.length - 1) updateFinal();
    persist();
  }
  prev.onclick = function () { show(state.slide - 1); };
  next.onclick = function () {
    if (state.slide === slides.length - 1) { finish(); return; }
    show(state.slide + 1);
  };
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') next.click();
    if (e.key === 'ArrowLeft') prev.click();
  });

  // ---------- Atom builder ----------
  var pIn = document.getElementById('pIn'), nIn = document.getElementById('nIn'), eIn = document.getElementById('eIn');
  function shells(e) {
    var caps = [2, 8, 8, 2], out = [];
    for (var i = 0; i < caps.length && e > 0; i++) { var t = Math.min(caps[i], e); out.push(t); e -= t; }
    return out;
  }
  function drawAtom() {
    var p = +pIn.value, n = +nIn.value, e = +eIn.value;
    document.getElementById('pOut').textContent = p;
    document.getElementById('nOut').textContent = n;
    document.getElementById('eOut').textContent = e;
    var el = ELEMENTS[p - 1];
    document.getElementById('rEl').textContent = el[2] + ' (' + el[1] + ')';
    document.getElementById('rA').textContent = p + n;
    var q = p - e;
    document.getElementById('rQ').textContent = q === 0 ? '0 (neutral)' : (q > 0 ? '+' + q : '−' + (-q)) + ' (ion)';
    var sh = shells(e);
    document.getElementById('rS').textContent = sh.length ? sh.join(', ') : '—';
    var goal = document.getElementById('goal');
    if (p === 8 && n === 8 && e === 8) { goal.textContent = '🎉 You built neutral oxygen-16!'; goal.className = 'goal ok'; }
    else { goal.textContent = 'Goal: neutral oxygen-16 (8 protons, 8 neutrons, 8 electrons).'; goal.className = 'goal'; }

    var svg = document.getElementById('atomSvg'), html = '';
    var cx = 120, cy = 120;
    sh.forEach(function (count, i) {
      var r = 40 + i * 24;
      html += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" class="shell"/>';
      for (var k = 0; k < count; k++) {
        var a = (k / count) * Math.PI * 2 - Math.PI / 2;
        html += '<circle cx="' + (cx + r * Math.cos(a)).toFixed(1) + '" cy="' + (cy + r * Math.sin(a)).toFixed(1) + '" r="5" class="ee"/>';
      }
    });
    var total = p + n, nucR = 6 + Math.sqrt(total) * 3.2;
    for (var j = 0; j < total; j++) {
      var ang = j * 2.399963, rad = nucR * Math.sqrt((j + 0.5) / total) * 0.85; // golden-angle packing
      html += '<circle cx="' + (cx + rad * Math.cos(ang)).toFixed(1) + '" cy="' + (cy + rad * Math.sin(ang)).toFixed(1) +
        '" r="4.6" class="' + (Math.floor((j + 1) * p / total) > Math.floor(j * p / total) ? 'pp' : 'nn') + '"/>';
    }
    svg.innerHTML = html;
  }
  [pIn, nIn, eIn].forEach(function (i) { i.addEventListener('input', drawAtom); });
  drawAtom();

  // ---------- Periodic table ----------
  var pt = document.getElementById('pt'), info = document.getElementById('ptInfo');
  ELEMENTS.forEach(function (d) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'el c-' + d[5];
    b.style.gridRow = d[3];
    b.style.gridColumn = d[4];
    b.innerHTML = '<small>' + d[0] + '</small><b>' + d[1] + '</b>';
    b.setAttribute('aria-label', d[2]);
    b.onclick = function () {
      Array.prototype.forEach.call(pt.children, function (c) { c.classList.remove('sel'); });
      b.classList.add('sel');
      var sh = shells(d[0]);
      info.innerHTML = '<h3>' + d[2] + ' (' + d[1] + ')</h3><dl class="readout">' +
        '<div><dt>Atomic number</dt><dd>' + d[0] + '</dd></div>' +
        '<div><dt>Atomic mass</dt><dd>' + d[6] + '</dd></div>' +
        '<div><dt>Period / Group</dt><dd>' + d[3] + ' / ' + d[4] + '</dd></div>' +
        '<div><dt>Type</dt><dd>' + CATEGORY[d[5]] + '</dd></div>' +
        '<div><dt>Shells</dt><dd>' + sh.join(', ') + '</dd></div>' +
        '<div><dt>Valence e⁻</dt><dd>' + (d[4] === 18 ? (d[0] === 2 ? 2 : 8) : sh[sh.length - 1]) + '</dd></div>' +
        '<div><dt>Common isotope</dt><dd>' + d[1] + '-' + (d[0] + d[7]) + '</dd></div></dl>';
    };
    pt.appendChild(b);
  });

  // ---------- Quiz ----------
  var form = document.getElementById('quiz'), result = document.getElementById('result');
  QUESTIONS.forEach(function (q, qi) {
    var fs = document.createElement('fieldset');
    fs.className = 'q';
    var html = '<legend><span class="qn">' + (qi + 1) + '</span>' + q.text + '</legend>';
    q.options.forEach(function (o, oi) {
      var checked = state.answers[q.id] === oi ? ' checked' : '';
      html += '<label class="opt"><input type="radio" name="' + q.id + '" value="' + oi + '"' + checked + '> <span>' + o + '</span></label>';
    });
    fs.innerHTML = html;
    form.appendChild(fs);
  });
  var submit = document.createElement('button');
  submit.type = 'submit'; submit.className = 'primary'; submit.textContent = 'Submit answers';
  form.appendChild(submit);
  form.addEventListener('change', function (e) {
    if (e.target.name) { state.answers[e.target.name] = +e.target.value; persist(); }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var correct = 0, missing = 0;
    var ts = new Date().toTimeString().slice(0, 8);
    QUESTIONS.forEach(function (q, qi) {
      var a = state.answers[q.id];
      var fs = form.children[qi];
      fs.classList.remove('right', 'wrong');
      if (a === undefined) { missing++; return; }
      var ok = a === q.answer;
      if (ok) correct++;
      fs.classList.add(ok ? 'right' : 'wrong');
      var n = 'cmi.interactions.' + qi + '.';
      SCORM.set(n + 'id', q.id);
      SCORM.set(n + 'type', 'choice');
      SCORM.set(n + 'time', ts);
      SCORM.set(n + 'student_response', String.fromCharCode(97 + a));
      SCORM.set(n + 'correct_responses.0.pattern', String.fromCharCode(97 + q.answer));
      SCORM.set(n + 'result', ok ? 'correct' : 'wrong');
    });
    if (missing) {
      result.hidden = false; result.className = 'result warn';
      result.textContent = 'Please answer all questions (' + missing + ' left).';
      return;
    }
    var score = Math.round(correct / QUESTIONS.length * 100);
    state.best = Math.max(state.best || 0, score);
    state.passed = state.passed || score >= PASS;
    SCORM.set('cmi.core.score.min', 0);
    SCORM.set('cmi.core.score.max', 100);
    SCORM.set('cmi.core.score.raw', state.best);
    SCORM.set('cmi.core.lesson_status', state.passed ? 'passed' : 'failed');
    persist();
    result.hidden = false;
    result.className = 'result ' + (score >= PASS ? 'ok' : 'bad');
    result.innerHTML = '<b>' + correct + ' / ' + QUESTIONS.length + ' correct — ' + score + '%</b><br>' +
      (score >= PASS ? 'Great work, you passed! Continue to the summary.' :
        'Not quite. Review the highlighted questions and try again.');
  });

  function updateFinal() {
    var el = document.getElementById('finalStatus');
    if (state.passed) { el.textContent = '✅ Passed with ' + state.best + '%. Click Finish to save and close.'; el.className = 'goal ok'; }
    else if (state.best !== null) { el.textContent = 'Best score ' + state.best + '%. Go back to the quiz to reach 70%.'; el.className = 'goal'; }
    else { el.textContent = 'You have not taken the quiz yet.'; el.className = 'goal'; }
  }

  var finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    persist();
    SCORM.finish();
    document.getElementById('finalStatus').textContent = SCORM.connected ? 'Progress saved. You can close this lesson.' : 'Preview mode (no LMS connected).';
  }
  window.addEventListener('pagehide', finish);
  window.addEventListener('beforeunload', finish);

  show(state.slide);
})();
