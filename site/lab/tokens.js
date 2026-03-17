// Token system — Neo-EDL Smart Fragment design tokens
// Inspired by BNY three-layer pipeline, flattened for Canvas 2D.
// Primitives (raw values) + semantics (contextual aliases).

var Tokens = (function () {

  // ─── PRIMITIVE SCALE ───
  // 16px base grid unit. All spatial values are multiples of 8.
  var GRID_UNIT = 16;
  var SCALE = [0, 8, 16, 24, 32, 48, 64, 80, 96, 128];

  // ─── LAYOUT GRID ───
  // 24 × 15 grid on 1920×1080 = 80px × 72px cells (both divisible by 8)
  var GRID_COLS = 24;
  var GRID_ROWS = 15;
  var CELL_W = 80;   // 1920 / 24
  var CELL_H = 72;   // 1080 / 15

  // ─── SPACING TOKENS ───
  // Fragment-internal padding (baked in, not external gutters)
  var spacing = {
    none: 0,
    xs:   8,     // 0.5 grid units — tight internal
    sm:   16,    // 1 grid unit
    md:   24,    // 1.5 grid units
    lg:   32,    // 2 grid units
    xl:   48     // 3 grid units
  };

  // ─── RADIUS TOKENS ───
  var radii = {
    outer:   80,   // corners facing device edge
    inner:   40,   // corners facing associated neighbour
    notch:   240,  // medium/large notch rectangles
    organic: 72    // boolean smoothing (midpoint of 64-80 range)
  };

  // ─── GAP TOKENS ───
  // Space between fragments based on relationship
  var gaps = {
    associated:    8,    // tight — related content
    disassociated: 24,   // breathing room — unrelated content
    notch:         8,    // boolean subtraction offset
    diagonal:      16    // between diagonal-cut panels
  };

  // ─── SIZE CATEGORIES ───
  // Proportion of fragment area to canvas area
  var SIZE_FULL    = 'full';      // >75%
  var SIZE_HALF    = 'half';      // 25-75%
  var SIZE_QUARTER = 'quarter';   // <25%

  // ─── ACTION TYPES ───
  // Determines notch eligibility and size
  var ACTION_PRIMARY   = 'primary';
  var ACTION_SECONDARY = 'secondary';
  var ACTION_NONE      = 'none';

  return {
    GRID_UNIT: GRID_UNIT,
    SCALE: SCALE,
    GRID_COLS: GRID_COLS,
    GRID_ROWS: GRID_ROWS,
    CELL_W: CELL_W,
    CELL_H: CELL_H,
    spacing: spacing,
    radii: radii,
    gaps: gaps,
    SIZE_FULL: SIZE_FULL,
    SIZE_HALF: SIZE_HALF,
    SIZE_QUARTER: SIZE_QUARTER,
    ACTION_PRIMARY: ACTION_PRIMARY,
    ACTION_SECONDARY: ACTION_SECONDARY,
    ACTION_NONE: ACTION_NONE
  };
})();
