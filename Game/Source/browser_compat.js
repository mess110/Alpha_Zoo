(function() {
  // In Electron, preload.js already defined window.gameFullScreen — do nothing.
  if (typeof window.gameFullScreen !== 'undefined') {
    return;
  }

  let _cachedMapData = null;
  let _hasMapSave    = false;

  // --- Fullscreen ---
  window.gameIsFullScreen = function() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  };

  window.gameFullScreen = function(make_fullscreen) {
    if (make_fullscreen) {
      let el = document.documentElement;
      (el.requestFullscreen || el.webkitRequestFullscreen || function(){}).call(el);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || function(){}).call(document);
    }
  };

  // --- Settings (browser defaults) ---
  window.getPersistMap       = function() { return true;  };
  window.getPersistPenStates = function() { return true;  };
  window.getPersistPurchases = function() { return false; };
  window.getCafeMathMode     = function() { return false; };

  // --- Save / Load (synchronous — data pre-fetched by browserInit) ---
  window.hasZooSave = function() { return _hasMapSave; };
  window.loadZoo    = function() { return _cachedMapData; };

  window.saveZoo = function(zoo_data) {
    try {
      localStorage.setItem('alpha_zoo_map', JSON.stringify(zoo_data));
      _cachedMapData = zoo_data;
      _hasMapSave = true;
      return 'zoo saved';            // save_zoo.js line 249 checks this string
    } catch (e) {
      console.error('browser saveZoo failed', e);
      return 'save failed';
    }
  };

  window.deleteZooSave = function() {
    localStorage.removeItem('alpha_zoo_map');
    _cachedMapData = null;
    _hasMapSave = false;
    return 'deleted';
  };

  // --- Password gate helper ---
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // --- Async entry point (replaces direct initialize() call) ---
  window.browserInit = async function() {

    // --- Password gate (browser only) ---
    // I understand the implications and the fact that this can be bypassed, but for the purpose of this game, we can consider this "good enough".
    // Just buy the game https://store.steampowered.com/app/1807640/Alpha_Zoo to support the creator
    const PASSWORD_HASH = "REPLACE_WITH_ACTUAL_HASH";
    const AUTH_KEY = "alpha_zoo_auth";

    if (localStorage.getItem(AUTH_KEY) !== PASSWORD_HASH) {
      // Show gate, hide canvas
      document.getElementById("password-gate").style.display = "flex";
      const canvas = document.querySelector("canvas");
      if (canvas) canvas.style.display = "none";

      await new Promise((resolve) => {
        const input = document.getElementById("password-input");
        const error = document.getElementById("password-error");

        input.focus();
        input.addEventListener("keydown", async (e) => {
          if (e.key === "Enter") {
            const hash = await hashPassword(input.value);
            if (hash === PASSWORD_HASH) {
              localStorage.setItem(AUTH_KEY, PASSWORD_HASH);
              document.getElementById("password-gate").style.display = "none";
              if (canvas) canvas.style.display = "";
              resolve();
            } else {
              error.textContent = "Wrong password";
              input.value = "";
              input.focus();
            }
          }
        });
      });
    }
    // --- End password gate ---

    // 1. Check localStorage for a prior in-browser save.
    let local = localStorage.getItem('alpha_zoo_map');
    if (local) {
      try {
        let parsed = JSON.parse(local);
        if (parsed && parsed.version === 1 && parsed.zoo &&
            parsed.zoo.pens && parsed.zoo.squares && parsed.zoo.vertices) {
          _cachedMapData = parsed;
          _hasMapSave = true;
        }
      } catch (e) { /* ignore corrupt saves */ }
    }

    // 2. If no local save, fetch map.json from the server.
    //    Future: replace this fetch with an API call.
    if (!_hasMapSave) {
      try {
        let res = await fetch('map.json');
        if (res.ok) {
          let data = await res.json();
          if (data && data.version === 1 && data.zoo &&
              data.zoo.pens && data.zoo.squares && data.zoo.vertices) {
            _cachedMapData = data;
            _hasMapSave = true;
          }
        }
      } catch (e) {
        console.log('browser_compat: map.json not available, generating new zoo');
      }
    }

    // 3. Explicitly trigger Bebas Neue download before Pixi.js renders any text.
    //    Browsers skip loading @font-face fonts not used by DOM elements, and all
    //    game text is drawn on canvas, so we must force it here.
    await document.fonts.load('16px "Bebas Neue"');

    // 4. All async work done — now start the game synchronously.
    initialize();
  };

})();
