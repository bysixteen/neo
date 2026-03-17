// Diagonal mode — panels split by grid-column shift
// The diagonal effect is NOT a fixed angle. It is created by:
// 1. Shapes whose top edges are shifted 1-2 grid columns from their bottom edges
// 2. Very large corner radii (80px+) create smooth curved transitions
// 3. The "very large round rect as cutting shape" technique (Liron Damir)
//    — a circle with radius ~2000px+ creates an approximately straight diagonal
// Gap between diagonal panels: 16px (Tokens.gaps.diagonal)

var Diagonal = (function () {

  // Compute clip polygons for N diagonal panels using grid-column shift
  // shift: number of grid columns the top edge shifts relative to bottom (1 or 2)
  // gap: pixels between panels (default Tokens.gaps.diagonal)
  function computePanels(panelCount, shift, gap) {
    if (panelCount < 1) return [];

    // Use content bounds (inset by chrome) for panel positioning
    var cb = contentBounds(0); // no extra padding — edge-to-edge within chrome
    var colW = CANVAS_W / VectorGrid.COLS;
    var shiftPx = shift * colW;

    var x0 = cb.x;
    var y0 = cb.y;
    var x1 = cb.x + cb.w;
    var y1 = cb.y + cb.h;

    var panels = [];
    var totalGap = gap * (panelCount - 1);
    var usableW = cb.w - totalGap;
    var panelW = usableW / panelCount;

    var dividers = [];
    var runningX = x0;
    for (var i = 0; i < panelCount - 1; i++) {
      runningX += panelW;
      var botX = runningX + gap / 2;
      var topX = botX + shiftPx;
      dividers.push({ topX: topX, botX: botX });
      runningX += gap;
    }

    for (var p = 0; p < panelCount; p++) {
      var leftDivider = (p > 0) ? dividers[p - 1] : null;
      var rightDivider = (p < panelCount - 1) ? dividers[p] : null;

      var leftTopX, leftBotX;
      if (leftDivider !== null) {
        leftTopX = leftDivider.topX + gap / 2;
        leftBotX = leftDivider.botX + gap / 2;
      } else {
        leftTopX = x0;
        leftBotX = x0;
      }

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
        index: p,
        // SmartFragment metadata for diagonal panels
        relationship: 'associated',
        padding: [Tokens.spacing.md, Tokens.spacing.md, Tokens.spacing.md, Tokens.spacing.md]
      });
    }

    return panels;
  }

  return {
    computePanels: computePanels
  };
})();
