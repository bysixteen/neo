// Layout presets — canonical Alexa EDL layouts
// Each preset returns a shapes array based on current parameters
// Corner radii are auto-computed from adjacency

var Layouts = (function () {

  // ─── AUTO CORNER RADIUS ───
  // For each corner of each shape, check if there's an adjacent shape
  // on the relevant edges. If yes → rInner, otherwise → rOuter.
  function assignRadii(shapes, gap, rOuter, rInner) {
    var tolerance = gap + 4; // adjacency detection tolerance

    for (var i = 0; i < shapes.length; i++) {
      var s = shapes[i];
      var hasRight = false, hasLeft = false, hasAbove = false, hasBelow = false;

      for (var j = 0; j < shapes.length; j++) {
        if (i === j) continue;
        var o = shapes[j];

        // Check horizontal adjacency (overlapping in Y)
        var overlapY = s.y < o.y + o.h && s.y + s.h > o.y;
        // Check vertical adjacency (overlapping in X)
        var overlapX = s.x < o.x + o.w && s.x + s.w > o.x;

        if (overlapY) {
          // Right neighbour
          if (Math.abs((s.x + s.w) - o.x) < tolerance) hasRight = true;
          // Left neighbour
          if (Math.abs(s.x - (o.x + o.w)) < tolerance) hasLeft = true;
        }
        if (overlapX) {
          // Below neighbour
          if (Math.abs((s.y + s.h) - o.y) < tolerance) hasBelow = true;
          // Above neighbour
          if (Math.abs(s.y - (o.y + o.h)) < tolerance) hasAbove = true;
        }
      }

      // TL: inner if has neighbour above OR left
      s.radii[0] = (hasAbove || hasLeft) ? rInner : rOuter;
      // TR: inner if has neighbour above OR right
      s.radii[1] = (hasAbove || hasRight) ? rInner : rOuter;
      // BR: inner if has neighbour below OR right
      s.radii[2] = (hasBelow || hasRight) ? rInner : rOuter;
      // BL: inner if has neighbour below OR left
      s.radii[3] = (hasBelow || hasLeft) ? rInner : rOuter;
    }

    return shapes;
  }

  // ─── PRESET DEFINITIONS ───

  function fullStage(p) {
    return [
      Shape(CX, CY, CW, CH, [p.rOuter, p.rOuter, p.rOuter, p.rOuter])
    ];
  }

  function twoPanel(p) {
    var leftW = Math.floor((CW - p.gap) * 0.55);
    var rightW = CW - leftW - p.gap;
    var shapes = [
      Shape(CX, CY, leftW, CH, [0,0,0,0]),
      Shape(CX + leftW + p.gap, CY, rightW, CH, [0,0,0,0])
    ];
    return assignRadii(shapes, p.gap, p.rOuter, p.rInner);
  }

  function threePanel(p) {
    var w1 = Math.floor(CW * 0.45);
    var w2 = Math.floor(CW * 0.33);
    var w3 = CW - w1 - w2 - p.gap * 2;
    var x1 = CX;
    var x2 = x1 + w1 + p.gap;
    var x3 = x2 + w2 + p.gap;
    var shapes = [
      Shape(x1, CY, w1, CH, [0,0,0,0]),
      Shape(x2, CY, w2, CH, [0,0,0,0]),
      Shape(x3, CY, w3, CH, [0,0,0,0])
    ];
    return assignRadii(shapes, p.gap, p.rOuter, p.rInner);
  }

  function contentSlices(p) {
    var leftW = Math.floor((CW - p.gap) * 0.6);
    var rightW = CW - leftW - p.gap;
    var rightX = CX + leftW + p.gap;
    var topH = Math.floor((CH - p.gap) * 0.55);
    var botH = CH - topH - p.gap;
    var shapes = [
      Shape(CX, CY, leftW, CH, [0,0,0,0]),
      Shape(rightX, CY, rightW, topH, [0,0,0,0]),
      Shape(rightX, CY + topH + p.gap, rightW, botH, [0,0,0,0])
    ];
    return assignRadii(shapes, p.gap, p.rOuter, p.rInner);
  }

  function widgets(p) {
    var colW = Math.floor((CW - p.gap) / 2);
    var rowH = Math.floor((CH - p.gap) / 2);
    var col2X = CX + colW + p.gap;
    var row2Y = CY + rowH + p.gap;
    // Adjust second column/row to fill remaining space
    var col2W = CW - colW - p.gap;
    var row2H = CH - rowH - p.gap;
    var shapes = [
      Shape(CX, CY, colW, rowH, [0,0,0,0]),
      Shape(col2X, CY, col2W, rowH, [0,0,0,0]),
      Shape(CX, row2Y, colW, row2H, [0,0,0,0]),
      Shape(col2X, row2Y, col2W, row2H, [0,0,0,0])
    ];
    return assignRadii(shapes, p.gap, p.rOuter, p.rInner);
  }

  // ─── NOTCH PRESETS ───
  // The "bibble" is actually a "notch" — a secondary shape that embeds
  // into a corner of the main container via boolean subtraction.
  // Three sizes: Small (circle), Medium (rect 240px r), Large (rect 240px r)

  function notchSmall(p) {
    // Small circle notch — bottom right (arrow/close/next)
    var notchSize = 64;
    var shapes = [
      Shape(CX, CY, CW, CH, [0,0,0,0]),
      Shape(CX + CW - notchSize, CY + CH - notchSize, notchSize, notchSize, [0,0,0,0],
        { notch: true, notchShape: 'circle', notchOffset: 8 })
    ];
    return assignRadii(shapes, p.gap, p.rOuter, p.rInner);
  }

  function notchMedium(p) {
    // Medium rectangle notch — bottom right (timer, nav, action)
    var notchW = 200;
    var notchH = 72;
    var shapes = [
      Shape(CX, CY, CW, CH, [0,0,0,0]),
      Shape(CX + CW - notchW, CY + CH - notchH, notchW, notchH, [0,0,0,0],
        { notch: true, notchShape: 'rect', notchOffset: 8 })
    ];
    return assignRadii(shapes, p.gap, p.rOuter, p.rInner);
  }

  function notchLarge(p) {
    // Large rectangle notch — bottom right (notification, content card)
    var notchW = 320;
    var notchH = 180;
    var shapes = [
      Shape(CX, CY, CW, CH, [0,0,0,0]),
      Shape(CX + CW - notchW, CY + CH - notchH, notchW, notchH, [0,0,0,0],
        { notch: true, notchShape: 'rect', notchOffset: 8 })
    ];
    return assignRadii(shapes, p.gap, p.rOuter, p.rInner);
  }

  function twoPanelNotch(p) {
    // Two panel + small notch at junction (v27 pattern)
    var leftW = Math.floor((CW - p.gap) * 0.4);
    var rightW = CW - leftW - p.gap;
    var notchSize = 64;
    var shapes = [
      Shape(CX, CY, leftW, CH, [0,0,0,0]),
      Shape(CX + leftW + p.gap, CY, rightW, CH, [0,0,0,0]),
      Shape(CX + leftW + p.gap - notchSize / 2, CY + CH - notchSize, notchSize, notchSize, [0,0,0,0],
        { notch: true, notchShape: 'circle', notchOffset: 8 })
    ];
    return assignRadii(shapes, p.gap, p.rOuter, p.rInner);
  }

  function twoPanelBlobBL(p) {
    // Two panel + organic blob bottom-left (v28 pattern)
    var leftW = Math.floor((CW - p.gap) * 0.55);
    var rightW = CW - leftW - p.gap;
    var blobW = 200;
    var blobH = 160;
    var shapes = [
      Shape(CX, CY, leftW, CH, [0,0,0,0]),
      Shape(CX + leftW + p.gap, CY, rightW, CH, [0,0,0,0]),
      Shape(CX, CY + CH - blobH, blobW, blobH, [0,0,0,0],
        { notch: true, notchShape: 'rect', notchOffset: 8 })
    ];
    return assignRadii(shapes, p.gap, p.rOuter, p.rInner);
  }

  function uiFullScreen(p) {
    // Full screen with small icons top-right and strip at bottom
    var iconSize = 48;
    var stripH = 64;
    var shapes = [
      Shape(CX, CY, CW, CH - stripH - p.gap, [0,0,0,0]),
      Shape(CX + CW - iconSize * 2 - p.gap, CY + CONTENT_PAD, iconSize, iconSize, [0,0,0,0]),
      Shape(CX + CW - iconSize, CY + CONTENT_PAD, iconSize, iconSize, [0,0,0,0]),
      Shape(CX, CY + CH - stripH, CW, stripH, [0,0,0,0])
    ];
    return assignRadii(shapes, p.gap, p.rOuter, p.rInner);
  }

  // ─── PRESET REGISTRY ───

  var PRESETS = {
    fullStage:      { label: 'Full Stage',       fn: fullStage,      panels: 1 },
    twoPanel:       { label: 'Two Panel',        fn: twoPanel,       panels: 2 },
    threePanel:     { label: 'Three Panel',      fn: threePanel,     panels: 3 },
    contentSlices:  { label: 'Content Slices',   fn: contentSlices,  panels: 3 },
    widgets:        { label: 'Widgets (2x2)',    fn: widgets,        panels: 4 },
    notchSmall:     { label: 'Notch: Small',     fn: notchSmall,     panels: 2 },
    notchMedium:    { label: 'Notch: Medium',    fn: notchMedium,    panels: 2 },
    notchLarge:     { label: 'Notch: Large',     fn: notchLarge,     panels: 2 },
    twoPanelNotch:  { label: '2 Panel + Notch',  fn: twoPanelNotch,  panels: 3 },
    twoPanelBlobBL: { label: '2 Panel + Blob',   fn: twoPanelBlobBL, panels: 3 },
    uiFullScreen:   { label: 'UI + Strip',       fn: uiFullScreen,   panels: 4 }
  };

  function generate(presetKey, params) {
    var preset = PRESETS[presetKey];
    if (!preset) return fullStage(params);
    return preset.fn(params);
  }

  return {
    PRESETS: PRESETS,
    generate: generate,
    assignRadii: assignRadii
  };
})();
