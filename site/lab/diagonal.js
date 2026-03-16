// Diagonal mode — panels split by grid-column shift
// The diagonal effect is NOT a fixed angle. It is created by:
// 1. Shapes whose top edges are shifted 1-2 grid columns from their bottom edges
// 2. Very large corner radii (80px+) create smooth curved transitions
// 3. The "very large round rect as cutting shape" technique (Liron Damir)
//    — a circle with radius ~2000px+ creates an approximately straight diagonal
// Gap between diagonal panels: 16px

var Diagonal = (function () {

  // Compute clip polygons for N diagonal panels using grid-column shift
  // shift: number of grid columns the top edge shifts relative to bottom (1 or 2)
  // gap: pixels between panels (default 16)
  function computePanels(panelCount, shift, gap) {
    if (panelCount < 1) return [];

    var colW = CONTENT_W / VectorGrid.COLS;
    var shiftPx = shift * colW; // convert grid columns to pixels

    // Content bounds
    var x0 = CONTENT_X;
    var y0 = CONTENT_Y;
    var x1 = CONTENT_X + CONTENT_W;
    var y1 = CONTENT_Y + CONTENT_H;

    // For N panels we need N-1 dividing lines
    var panels = [];

    // Compute divider positions at top and bottom edges
    // Each divider is an evenly-spaced vertical cut, but the top x is shifted
    var totalGap = gap * (panelCount - 1);
    var usableW = CONTENT_W - totalGap;
    var panelW = usableW / panelCount;

    var dividers = []; // { topX, botX } for each divider line

    var runningX = x0;
    for (var i = 0; i < panelCount - 1; i++) {
      runningX += panelW;
      // Bottom x is the straight divider position
      var botX = runningX + gap / 2;
      // Top x is shifted by shiftPx (negative = lean left at top)
      var topX = botX + shiftPx;
      dividers.push({ topX: topX, botX: botX });
      runningX += gap;
    }

    // Build clip polygons for each panel
    for (var p = 0; p < panelCount; p++) {
      var leftDivider = (p > 0) ? dividers[p - 1] : null;
      var rightDivider = (p < panelCount - 1) ? dividers[p] : null;

      // Left edge
      var leftTopX, leftBotX;
      if (leftDivider !== null) {
        leftTopX = leftDivider.topX + gap / 2;
        leftBotX = leftDivider.botX + gap / 2;
      } else {
        leftTopX = x0;
        leftBotX = x0;
      }

      // Right edge
      var rightTopX, rightBotX;
      if (rightDivider !== null) {
        rightTopX = rightDivider.topX - gap / 2;
        rightBotX = rightDivider.botX - gap / 2;
      } else {
        rightTopX = x1;
        rightBotX = x1;
      }

      panels.push({
        clipPoints: [
          { x: leftTopX, y: y0 },
          { x: rightTopX, y: y0 },
          { x: rightBotX, y: y1 },
          { x: leftBotX, y: y1 }
        ],
        bounds: {
          x: Math.min(leftTopX, leftBotX),
          y: y0,
          w: Math.max(rightTopX, rightBotX) - Math.min(leftTopX, leftBotX),
          h: y1 - y0
        },
        index: p
      });
    }

    return panels;
  }

  return {
    computePanels: computePanels
  };
})();
