// Layout state definitions — exact pixel values from the design rules
// Each state is an array of shapes with position, size, and per-corner radii

var CANVAS_W = 1920;
var CANVAS_H = 1080;

// Device chrome dimensions
var CHROME_PAD = 28;       // padding from canvas edge to device frame
var STATUS_H = 48;         // status bar height
var DEVICE_RADIUS = 32;    // device frame corner radius

// Content area (inside device frame, below status bar)
var CONTENT_X = CHROME_PAD;
var CONTENT_Y = CHROME_PAD + STATUS_H;
var CONTENT_W = CANVAS_W - CHROME_PAD * 2;
var CONTENT_H = CANVAS_H - CHROME_PAD * 2 - STATUS_H;
var CONTENT_PAD = 16; // inner padding within content area

// Shorthand for content-relative positioning
var CX = CONTENT_X + CONTENT_PAD;
var CY = CONTENT_Y + CONTENT_PAD;
var CW = CONTENT_W - CONTENT_PAD * 2;
var CH = CONTENT_H - CONTENT_PAD * 2;

var GAP_RELATED = 8;
var GAP_UNRELATED = 24;
var R_OUTER = 80;
var R_INNER = 40;

// Shape factory
function Shape(x, y, w, h, radii, opts) {
  var s = {
    x: x, y: y, w: w, h: h,
    radii: radii || [R_OUTER, R_OUTER, R_OUTER, R_OUTER],
    opacity: 1,
    scale: 1
  };
  if (opts) {
    for (var k in opts) s[k] = opts[k];
  }
  return s;
}

// ─── DEMO DEFINITIONS ───

var DEMOS = {
  bibble: {
    label: 'Bibble',
    description: 'A small element pops into the bottom-right corner',
    states: {
      empty: function () {
        return [
          Shape(CX, CY, CW, CH, [R_OUTER, R_OUTER, R_OUTER, R_OUTER])
        ];
      },
      bibble: function () {
        var bibbleSize = 88;
        var mainW = CW;
        var mainH = CH - bibbleSize - GAP_RELATED;
        return [
          Shape(CX, CY, mainW, CH, [R_OUTER, R_OUTER, R_INNER, R_OUTER]),
          Shape(CX + CW - bibbleSize, CY + CH - bibbleSize, bibbleSize, bibbleSize,
            [R_INNER, R_INNER, R_OUTER, R_INNER], { scale: 1 })
        ];
      }
    },
    triggers: [
      { label: 'Add Bibble', from: 'empty', to: 'bibble' },
      { label: 'Remove Bibble', from: 'bibble', to: 'empty' }
    ],
    initial: 'empty'
  },

  split: {
    label: 'Two Panel',
    description: 'Panel splits into two related panels',
    states: {
      single: function () {
        return [
          Shape(CX, CY, CW, CH, [R_OUTER, R_OUTER, R_OUTER, R_OUTER])
        ];
      },
      split: function () {
        var leftW = Math.floor((CW - GAP_RELATED) * 0.55);
        var rightW = CW - leftW - GAP_RELATED;
        return [
          Shape(CX, CY, leftW, CH, [R_OUTER, R_INNER, R_INNER, R_OUTER]),
          Shape(CX + leftW + GAP_RELATED, CY, rightW, CH, [R_INNER, R_OUTER, R_OUTER, R_INNER])
        ];
      }
    },
    triggers: [
      { label: 'Split', from: 'single', to: 'split' },
      { label: 'Merge', from: 'split', to: 'single' }
    ],
    initial: 'single'
  },

  subdivide: {
    label: 'Subdivide',
    description: 'Right panel splits vertically, bibble appears',
    states: {
      two: function () {
        var leftW = Math.floor((CW - GAP_RELATED) * 0.55);
        var rightW = CW - leftW - GAP_RELATED;
        return [
          Shape(CX, CY, leftW, CH, [R_OUTER, R_INNER, R_INNER, R_OUTER]),
          Shape(CX + leftW + GAP_RELATED, CY, rightW, CH, [R_INNER, R_OUTER, R_OUTER, R_INNER])
        ];
      },
      subdivided: function () {
        var leftW = Math.floor((CW - GAP_RELATED) * 0.55);
        var rightW = CW - leftW - GAP_RELATED;
        var rightX = CX + leftW + GAP_RELATED;
        var topH = Math.floor((CH - GAP_RELATED) * 0.55);
        var botH = CH - topH - GAP_RELATED;
        return [
          Shape(CX, CY, leftW, CH, [R_OUTER, R_INNER, R_INNER, R_OUTER]),
          Shape(rightX, CY, rightW, topH, [R_INNER, R_OUTER, R_INNER, R_INNER]),
          Shape(rightX, CY + topH + GAP_RELATED, rightW, botH, [R_INNER, R_INNER, R_OUTER, R_INNER])
        ];
      },
      withBibble: function () {
        var leftW = Math.floor((CW - GAP_RELATED) * 0.55);
        var rightW = CW - leftW - GAP_RELATED;
        var rightX = CX + leftW + GAP_RELATED;
        var topH = Math.floor((CH - GAP_RELATED) * 0.55);
        var botH = CH - topH - GAP_RELATED;
        var bibbleSize = 80;
        return [
          Shape(CX, CY, leftW, CH, [R_OUTER, R_INNER, R_INNER, R_OUTER]),
          Shape(rightX, CY, rightW, topH, [R_INNER, R_OUTER, R_INNER, R_INNER]),
          Shape(rightX, CY + topH + GAP_RELATED, rightW, botH, [R_INNER, R_INNER, R_INNER, R_INNER]),
          Shape(rightX + rightW - bibbleSize, CY + CH - bibbleSize, bibbleSize, bibbleSize,
            [R_INNER, R_INNER, R_OUTER, R_INNER])
        ];
      }
    },
    triggers: [
      { label: 'Subdivide', from: 'two', to: 'subdivided' },
      { label: 'Add Bibble', from: 'subdivided', to: 'withBibble' },
      { label: 'Remove Bibble', from: 'withBibble', to: 'subdivided' },
      { label: 'Collapse', from: 'subdivided', to: 'two' }
    ],
    initial: 'two'
  },

  carousel: {
    label: 'Carousel',
    description: 'Panels compress as they scroll off-screen',
    states: {
      two: function () {
        var w1 = Math.floor((CW - GAP_RELATED) / 2);
        var w2 = CW - w1 - GAP_RELATED;
        return [
          Shape(CX, CY, w1, CH, [R_OUTER, R_INNER, R_INNER, R_OUTER]),
          Shape(CX + w1 + GAP_RELATED, CY, w2, CH, [R_INNER, R_OUTER, R_OUTER, R_INNER])
        ];
      },
      three: function () {
        var w1 = Math.floor(CW * 0.45);
        var w2 = Math.floor(CW * 0.35);
        var w3 = CW - w1 - w2 - GAP_RELATED * 2;
        var x1 = CX;
        var x2 = x1 + w1 + GAP_RELATED;
        var x3 = x2 + w2 + GAP_RELATED;
        return [
          Shape(x1, CY, w1, CH, [R_OUTER, R_INNER, R_INNER, R_OUTER]),
          Shape(x2, CY, w2, CH, [R_INNER, R_INNER, R_INNER, R_INNER]),
          Shape(x3, CY, w3, CH, [R_INNER, R_OUTER, R_OUTER, R_INNER])
        ];
      },
      four: function () {
        var w1 = Math.floor(CW * 0.38);
        var w2 = Math.floor(CW * 0.28);
        var w3 = Math.floor(CW * 0.2);
        var w4 = CW - w1 - w2 - w3 - GAP_RELATED * 3;
        var x1 = CX;
        var x2 = x1 + w1 + GAP_RELATED;
        var x3 = x2 + w2 + GAP_RELATED;
        var x4 = x3 + w3 + GAP_RELATED;
        return [
          Shape(x1, CY, w1, CH, [R_OUTER, R_INNER, R_INNER, R_OUTER]),
          Shape(x2, CY, w2, CH, [R_INNER, R_INNER, R_INNER, R_INNER]),
          Shape(x3, CY, w3, CH, [R_INNER, R_INNER, R_INNER, R_INNER]),
          Shape(x4, CY, w4, CH, [R_INNER, R_OUTER, R_OUTER, R_INNER])
        ];
      }
    },
    triggers: [
      { label: 'Add Panel', from: 'two', to: 'three' },
      { label: 'Add Another', from: 'three', to: 'four' },
      { label: 'Remove Panel', from: 'four', to: 'three' },
      { label: 'Collapse', from: 'three', to: 'two' }
    ],
    initial: 'two'
  }
};
