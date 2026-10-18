/*
 * dash.js — a small standalone stand-in for the dashboard runtime this page
 * was first built on. It gives the page the same `dash` object it expects:
 *
 *   dash.calc(name, { inputs, fn })   register a table computed from other tables
 *   dash.data(name)                   -> { status: 'loading' | 'ok' | 'error', data }
 *   dash.params() / setParams / resetParams   the page's filters
 *   dash.setLink(id)                  put a section or tab name in the URL hash
 *   dash.onData(fn)                   redraw callback (data ready, filter change, resize)
 *   dash.colors                       series colors, themed in style.css
 *
 * Filters live in the query string (?race=100&gender=F), so any view can be
 * bookmarked or shared as a link.
 */
(function () {
  'use strict';

  var DATA_URL = 'data/big_sugar_results.json';
  var DEFAULTS = { race: '50', gender: 'all', age_group: 'all', bin: 15, origin_view: 'all', ymode: 'count' };
  var NUMERIC = { bin: true };

  var sources = { results: { status: 'loading' } };
  var calcs = {};
  var listeners = [];
  var params = Object.assign({}, DEFAULTS, readQuery());
  var scheduled = false;

  function readQuery() {
    var out = {};
    try {
      new URLSearchParams(location.search).forEach(function (v, k) {
        if (!Object.prototype.hasOwnProperty.call(DEFAULTS, k)) return;
        out[k] = NUMERIC[k] ? Number(v) : v;
      });
    } catch (e) { /* ignore a malformed query */ }
    return out;
  }

  function writeQuery() {
    try {
      var q = new URLSearchParams();
      Object.keys(DEFAULTS).forEach(function (k) {
        if (String(params[k]) !== String(DEFAULTS[k])) q.set(k, params[k]);
      });
      var s = q.toString();
      history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
    } catch (e) { /* history may be unavailable in some embeds */ }
  }

  function runCalcs() {
    Object.keys(calcs).forEach(function (name) {
      var c = calcs[name];
      var inputs = c.inputs.map(function (i) { return sources[i]; });
      if (inputs.some(function (s) { return !s || s.status === 'error'; })) {
        sources[name] = { status: 'error' };
      } else if (inputs.some(function (s) { return s.status !== 'ok'; })) {
        sources[name] = { status: 'loading' };
      } else {
        try {
          sources[name] = { status: 'ok', data: c.fn.apply(null, inputs.map(function (s) { return s.data; })) };
        } catch (e) {
          console.error('dash.calc("' + name + '") failed:', e);
          sources[name] = { status: 'error' };
        }
      }
    });
  }

  function emit() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      listeners.forEach(function (fn) {
        try { fn(); } catch (e) { console.error(e); }
      });
    });
  }

  var dash = {
    colors: ['var(--series-1)', 'var(--series-2)', 'var(--series-3)'],

    calc: function (name, spec) {
      calcs[name] = { inputs: spec.inputs || [], fn: spec.fn };
      sources[name] = { status: 'loading' };
      runCalcs();
    },

    data: function (name) {
      return sources[name] || { status: 'error' };
    },

    params: function () { return Object.assign({}, params); },

    setParams: function (patch) {
      params = Object.assign({}, params, patch);
      writeQuery();
      emit();
    },

    resetParams: function () {
      params = Object.assign({}, DEFAULTS);
      try { history.replaceState(null, '', location.pathname); } catch (e) {}
      writeQuery();
      emit();
    },

    setLink: function (id) {
      try { history.replaceState(null, '', location.pathname + location.search + (id ? '#' + id : '')); } catch (e) {}
    },

    onData: function (fn) {
      listeners.push(fn);
      emit();
    },
  };

  window.dash = dash;

  fetch(DATA_URL)
    .then(function (r) {
      if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
      return r.json();
    })
    .then(function (rows) { sources.results = { status: 'ok', data: rows }; })
    .catch(function (e) {
      console.error('Could not load ' + DATA_URL + ':', e);
      sources.results = { status: 'error' };
    })
    .then(function () { runCalcs(); emit(); });

  // Opening a link like #100-elite lets the browser focus that tab button,
  // which draws a focus ring nobody asked for; drop it once the page loads.
  window.addEventListener('load', function () {
    var a = document.activeElement;
    if (a && a.id && location.hash === '#' + a.id && a.getAttribute('role') === 'tab') a.blur();
  });

  // Charts size themselves to their box, so redraw when the width changes.
  var lastW = window.innerWidth, t = null;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(t);
    t = setTimeout(emit, 120);
  });

  // Follow the system light/dark switch while the page is open.
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', emit);
  } catch (e) {}
})();
