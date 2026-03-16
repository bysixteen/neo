// Vector Grid — attachment-based grid system for the Alexa EDL
// "The EDL uses a grid of lines that act as 'attachment' vectors.
//  Not a traditional grid. Spacing tokens or the edges of components
//  can be attached to this grid."

var VectorGrid = (function () {
  var COLS = 18;
  var ROWS = 12;
  var SNAP_THRESHOLD = 3; // px tolerance for attachment detection

  // Grid line positions (computed from content area)
  function getVerticalLines() {
    var lines = [];
    for (var i = 0; i <= COLS; i++) {
      lines.push({
        x: CX + (i * CW / COLS),
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
        y: CY + (j * CH / ROWS),
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

      // Check vertical lines against left/right edges
      for (var i = 0; i < vLines.length; i++) {
        var lx = vLines[i].x;
        if (Math.abs(sh.x - lx) < SNAP_THRESHOLD ||
            Math.abs(sh.x + sh.w - lx) < SNAP_THRESHOLD) {
          vLines[i].attached = true;
        }
      }

      // Check horizontal lines against top/bottom edges
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

  // Nearest grid point to a position
  function nearestCol(x) {
    var colW = CONTENT_W / COLS;
    return Math.round((x - CONTENT_X) / colW);
  }

  function nearestRow(y) {
    var rowH = CONTENT_H / ROWS;
    return Math.round((y - CONTENT_Y) / rowH);
  }

  return {
    COLS: COLS,
    ROWS: ROWS,
    compute: compute,
    nearestCol: nearestCol,
    nearestRow: nearestRow,
    getVerticalLines: getVerticalLines,
    getHorizontalLines: getHorizontalLines
  };
})();
