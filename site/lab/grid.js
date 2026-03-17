// Vector Grid — edge-to-edge attachment grid for the Alexa Neo-EDL
// 24 × 15 layout grid (80px × 72px cells) spanning the full device canvas.
// 16px snap grid underneath for precise positioning.

var VectorGrid = (function () {
  // Layout grid — conceptual columns/rows for attachment
  var COLS = Tokens.GRID_COLS;   // 24
  var ROWS = Tokens.GRID_ROWS;   // 15

  // Snap grid — fine positioning
  var SNAP_UNIT = Tokens.GRID_UNIT;  // 16px

  var SNAP_THRESHOLD = 3; // px tolerance for attachment detection

  // Grid lines span the full canvas (edge-to-edge)
  function getVerticalLines() {
    var lines = [];
    for (var i = 0; i <= COLS; i++) {
      lines.push({
        x: i * CANVAS_W / COLS,
        col: i,
        attached: false
      });
    }
    return lines;
  }

  function getHorizontalLines() {
    var lines = [];
    for (var j = 0; j <= ROWS; j++) {
      lines.push({
        y: j * CANVAS_H / ROWS,
        row: j,
        attached: false
      });
    }
    return lines;
  }

  // Find which grid lines have shape edges attached
  function findAttachments(shapes, vLines, hLines) {
    for (var s = 0; s < shapes.length; s++) {
      var sh = shapes[s];
      if (!sh || sh.w < 1) continue;

      for (var i = 0; i < vLines.length; i++) {
        var lx = vLines[i].x;
        if (Math.abs(sh.x - lx) < SNAP_THRESHOLD ||
            Math.abs(sh.x + sh.w - lx) < SNAP_THRESHOLD) {
          vLines[i].attached = true;
        }
      }

      for (var j = 0; j < hLines.length; j++) {
        var ly = hLines[j].y;
        if (Math.abs(sh.y - ly) < SNAP_THRESHOLD ||
            Math.abs(sh.y + sh.h - ly) < SNAP_THRESHOLD) {
          hLines[j].attached = true;
        }
      }
    }
  }

  // Get the full grid state for rendering
  function compute(shapes) {
    var vLines = getVerticalLines();
    var hLines = getHorizontalLines();
    findAttachments(shapes, vLines, hLines);
    return { vertical: vLines, horizontal: hLines, cols: COLS, rows: ROWS };
  }

  // Snap a value to the nearest 16px increment
  function snapToGrid(value) {
    return Math.round(value / SNAP_UNIT) * SNAP_UNIT;
  }

  // Nearest layout grid column/row
  function nearestCol(x) {
    return Math.round(x / (CANVAS_W / COLS));
  }

  function nearestRow(y) {
    return Math.round(y / (CANVAS_H / ROWS));
  }

  return {
    COLS: COLS,
    ROWS: ROWS,
    SNAP_UNIT: SNAP_UNIT,
    compute: compute,
    snapToGrid: snapToGrid,
    nearestCol: nearestCol,
    nearestRow: nearestRow,
    getVerticalLines: getVerticalLines,
    getHorizontalLines: getHorizontalLines
  };
})();
