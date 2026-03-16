// Structure Lab — boot, sidebar wiring, animation loop

(function () {
  var canvas = document.getElementById('canvas');

  // State
  var currentPreset = 'fullStage';
  var currentShapes = [];
  var diagonalPanels = null; // null = orthogonal mode
  var mode = 'ortho'; // 'ortho' or 'diagonal'

  // Parameters
  var params = {
    gap: 8,
    rOuter: 80,
    rInner: 40,
    diagonalShift: 1,  // grid columns to shift top edge (1 or 2)
    diagonalGap: 16
  };

  // Display flags
  var display = {
    showGrid: true,
    showGridBeyond: false,
    showPoints: false,
    showRadii: true,
    showGaps: true,
    showDims: false
  };

  // ─── INIT ───

  Renderer.init(canvas);

  // Build layout preset buttons
  var layoutContainer = document.getElementById('layout-presets');
  var presetKeys = Object.keys(Layouts.PRESETS);
  presetKeys.forEach(function (key) {
    var preset = Layouts.PRESETS[key];
    var btn = document.createElement('button');
    btn.className = 'layout-btn';
    btn.textContent = preset.label;
    btn.dataset.preset = key;
    btn.addEventListener('click', function () { selectPreset(key); });
    layoutContainer.appendChild(btn);
  });

  // Diagonal-only presets
  var diagContainer = document.getElementById('diagonal-presets');
  [2, 3, 4, 5].forEach(function (n) {
    var btn = document.createElement('button');
    btn.className = 'layout-btn diag-preset';
    btn.textContent = n + ' Panel';
    btn.addEventListener('click', function () {
      setMode('diagonal');
      diagonalPanels = Diagonal.computePanels(n, params.diagonalShift, params.diagonalGap);
      currentShapes = []; // clear ortho shapes
    });
    diagContainer.appendChild(btn);
  });

  // Mode toggle
  var btnOrtho = document.getElementById('mode-ortho');
  var btnDiag = document.getElementById('mode-diagonal');
  btnOrtho.addEventListener('click', function () { setMode('ortho'); });
  btnDiag.addEventListener('click', function () { setMode('diagonal'); });

  // Structure sliders
  wireSlider('gap', 0, 40, 1, params.gap, function (v) {
    params.gap = v;
    regenerate();
  });
  wireSlider('rOuter', 0, 120, 1, params.rOuter, function (v) {
    params.rOuter = v;
    regenerate();
  });
  wireSlider('rInner', 0, 120, 1, params.rInner, function (v) {
    params.rInner = v;
    regenerate();
  });

  // Related/Unrelated toggle
  var relatedToggle = document.getElementById('toggle-related');
  relatedToggle.addEventListener('click', function () {
    var isRelated = relatedToggle.classList.toggle('active');
    if (isRelated) {
      params.gap = 8;
      params.rInner = 40;
    } else {
      params.gap = 24;
      params.rInner = 80;
    }
    updateSliderUI('gap', params.gap);
    updateSliderUI('rInner', params.rInner);
    regenerate();
  });
  relatedToggle.classList.add('active'); // start as related

  // Diagonal sliders
  wireSlider('diagShift', 0, 4, 0.5, params.diagonalShift, function (v) {
    params.diagonalShift = v;
    if (mode === 'diagonal') regenerateDiagonal();
  });
  wireSlider('diagGap', 0, 40, 1, params.diagonalGap, function (v) {
    params.diagonalGap = v;
    if (mode === 'diagonal') regenerateDiagonal();
  });

  // Display toggles
  wireCheckbox('showGrid', display.showGrid, function (v) { display.showGrid = v; });
  wireCheckbox('showGridBeyond', display.showGridBeyond, function (v) { display.showGridBeyond = v; });
  wireCheckbox('showPoints', display.showPoints, function (v) { display.showPoints = v; });
  wireCheckbox('showRadii', display.showRadii, function (v) { display.showRadii = v; });
  wireCheckbox('showGaps', display.showGaps, function (v) { display.showGaps = v; });
  wireCheckbox('showDims', display.showDims, function (v) { display.showDims = v; });

  // Motion section toggle
  var motionHeader = document.getElementById('motion-toggle');
  var motionBody = document.getElementById('motion-body');
  if (motionHeader) {
    motionHeader.addEventListener('click', function () {
      motionBody.classList.toggle('collapsed');
      motionHeader.classList.toggle('open');
    });
  }

  // Spring controls (demoted)
  var springDuration = 0.45;
  var springBounce = 0.35;
  var materialContainer = document.getElementById('material-presets');
  if (materialContainer) {
    var mKeys = Object.keys(MATERIAL_PRESETS);
    mKeys.forEach(function (key) {
      var preset = MATERIAL_PRESETS[key];
      var btn = document.createElement('button');
      btn.className = 'preset-btn';
      btn.textContent = preset.label;
      btn.addEventListener('click', function () {
        springDuration = preset.duration;
        springBounce = preset.bounce;
        Transition.setSpringParams(springDuration, springBounce);
      });
      materialContainer.appendChild(btn);
    });
  }

  // Resize
  window.addEventListener('resize', function () { Renderer.resize(); });

  // ─── LOGIC ───

  function setMode(m) {
    mode = m;
    btnOrtho.classList.toggle('active', m === 'ortho');
    btnDiag.classList.toggle('active', m === 'diagonal');

    // Show/hide diagonal section
    var diagSection = document.getElementById('diagonal-section');
    diagSection.style.display = m === 'diagonal' ? 'block' : 'none';

    if (m === 'ortho') {
      diagonalPanels = null;
      regenerate();
    } else {
      regenerateDiagonal();
    }
  }

  function selectPreset(key) {
    currentPreset = key;
    // Highlight active button
    var btns = layoutContainer.querySelectorAll('.layout-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].dataset.preset === key);
    }

    if (mode === 'ortho') {
      var newShapes = Layouts.generate(currentPreset, params);
      animateTo(newShapes);
    }
  }

  function regenerate() {
    if (mode !== 'ortho') return;
    var newShapes = Layouts.generate(currentPreset, params);
    animateTo(newShapes);
  }

  function regenerateDiagonal() {
    // Default to 3 panels if no explicit selection
    var panelCount = diagonalPanels ? diagonalPanels.length : 3;
    diagonalPanels = Diagonal.computePanels(panelCount, params.diagonalShift, params.diagonalGap);
    currentShapes = [];
  }

  function animateTo(newShapes) {
    if (currentShapes.length === 0) {
      currentShapes = newShapes;
      return;
    }
    Transition.setSpringParams(springDuration, springBounce);
    Transition.start(currentShapes, newShapes, performance.now());
  }

  // ─── HELPERS ───

  function wireSlider(id, min, max, step, initial, onChange) {
    var slider = document.getElementById(id);
    var valEl = document.getElementById(id + '-val');
    if (!slider) return;
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = initial;
    if (valEl) valEl.textContent = initial;
    slider.addEventListener('input', function () {
      var v = parseFloat(this.value);
      if (valEl) valEl.textContent = v;
      onChange(v);
    });
  }

  function updateSliderUI(id, value) {
    var slider = document.getElementById(id);
    var valEl = document.getElementById(id + '-val');
    if (slider) slider.value = value;
    if (valEl) valEl.textContent = value;
  }

  function wireCheckbox(id, initial, onChange) {
    var cb = document.getElementById(id);
    if (!cb) return;
    cb.checked = initial;
    cb.addEventListener('change', function () {
      onChange(this.checked);
    });
  }

  // ─── ANIMATION LOOP ───

  function loop() {
    var now = performance.now();

    if (Transition.isActive()) {
      currentShapes = Transition.update(now);
    }

    Renderer.render(currentShapes, display, diagonalPanels);
    requestAnimationFrame(loop);
  }

  // ─── BOOT ───

  setMode('ortho');
  selectPreset('twoPanel');
  requestAnimationFrame(loop);
})();
