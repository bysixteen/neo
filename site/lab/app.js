// Structure Lab — Organic Knockout playground
// Single layout: full-screen container + circular notch with organic fillet blending

(function () {
  var canvas = document.getElementById('canvas');

  // Parameters
  var params = {
    notchSize: 200,
    notchOffset: Tokens.gaps.notch,
    rOrganic: Tokens.radii.organic,
    rOuter: Tokens.radii.outer
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

  // Current scene
  var scene = null;

  // ─── INIT ───

  Renderer.init(canvas);

  // Notch sliders
  wireSlider('notchSize', 80, 400, 8, params.notchSize, function (v) {
    params.notchSize = v;
    regenerate();
  });
  wireSlider('notchOffset', 0, 32, 1, params.notchOffset, function (v) {
    params.notchOffset = v;
    regenerate();
  });
  wireSlider('rOrganic', 0, 120, 4, params.rOrganic, function (v) {
    params.rOrganic = v;
    regenerate();
  });

  // Container slider
  wireSlider('rOuter', 0, 120, 1, params.rOuter, function (v) {
    params.rOuter = v;
    regenerate();
  });

  // Display toggles
  wireCheckbox('showGrid', display.showGrid, function (v) { display.showGrid = v; });
  wireCheckbox('showGridBeyond', display.showGridBeyond, function (v) { display.showGridBeyond = v; });
  wireCheckbox('showPoints', display.showPoints, function (v) { display.showPoints = v; });
  wireCheckbox('showRadii', display.showRadii, function (v) { display.showRadii = v; });
  wireCheckbox('showGaps', display.showGaps, function (v) { display.showGaps = v; });
  wireCheckbox('showDims', display.showDims, function (v) { display.showDims = v; });

  // Resize
  window.addEventListener('resize', function () { Renderer.resize(); });

  // ─── LOGIC ───

  function regenerate() {
    scene = Layouts.organicKnockout(params);
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
    Renderer.renderOrganic(scene, display);
    requestAnimationFrame(loop);
  }

  // ─── BOOT ───

  regenerate();
  requestAnimationFrame(loop);
})();
