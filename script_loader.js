(function () {
  'use strict';
  var MODERN = 1 << 0;
  var LEGACY = 1 << 1;
  var MODERN_SCRIPT_TYPE = 'module';
  var LEGACY_SCRIPT_TYPE = 'text/javascript';
  var modernChecker = document.createElement('script');
  var legacyChecker = document.createElement('script');
  var done = false;

  function beforeloadHandler(e) {
    // beforeload should trigger for the `check` script if
    // type="module" is supported"
    removeListener();
    if (e.target === modernChecker) {
      e.preventDefault();
      insertScripts(MODERN);
    } else if (e.target === legacyChecker) {
      e.preventDefault();
      insertScripts(LEGACY);
    } else {
      // beforeload did not trigger for neither modernChecker nor legacyChecker
      // this is unlikely, but don't prevent default just in case.
      insertScripts(LEGACY);
    }
    addListener();
  }

  function addListener() {
    document.addEventListener('beforeload', beforeloadHandler, true);
  }

  function removeListener() {
    document.removeEventListener('beforeload', beforeloadHandler, true);
  }

  if (!('noModule' in modernChecker)) {
    if ('onbeforeload' in modernChecker) {
      addListener();
      injectFeatureDetectorScript(modernChecker, MODERN_SCRIPT_TYPE);
      injectFeatureDetectorScript(legacyChecker, LEGACY_SCRIPT_TYPE);
      removeListener();
    }
    else {
      // noModule is not supported and we cannot reliably detect module
      // support and insert scripts before document is parsed. Edge is
      // one such browser that has this behaviour. Just send ES5.
      insertScripts(LEGACY);
    }
  }
  else {
    insertScripts(MODERN);
  }

  function injectFeatureDetectorScript(script, type) {
    script.type = type;
    script.src = '.';
    document.head.appendChild(script);
    script.remove();
  }

  function insertScripts(type) {
    if (done === true) return;
    done = true;
    var scripts = window.__SCRIPTS__;
    for (var i = 0; i < scripts.length; i++) {
      insertScript(scripts[i][type === LEGACY ? 1 : 0]);
    }
  }

  function insertScript(src) {
    document.write('<script type="' + LEGACY_SCRIPT_TYPE + '" src="' + src + '"><\/script>');
  }
}());
