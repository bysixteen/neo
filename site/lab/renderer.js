// Canvas 2D renderer — Alexa Neo-EDL Structure Lab
// Navy monochrome palette, solid edges, device chrome, grid overlay, annotations

var Renderer = (function () {
  var canvas, ctx;
  var scale = 1;
  var offsetX = 0;
  var offsetY = 0;

  // Navy monochrome palette — from Manus visual spec
  var SHAPE_FILLS = [
    'rgba(91, 141, 184, 0.90)',
    'rgba(91, 141, 184, 0.90)',
    'rgba(91, 141, 184, 0.90)',
    'rgba(91, 141, 184, 0.90)',
    'rgba(91, 141, 184, 0.90)',
    'rgba(91, 141, 184, 0.90)'
  ];

  var BG_COLOR = '#0B1929';
  var CHROME_COLOR = '#132238';
  var STATUS_TEXT = 'rgba(255, 255, 255, 0.5)';
  var STATUS_ICON = 'rgba(255, 255, 255, 0.35)';

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    resize();
  }

  function resize() {
    var wrap = canvas.parentElement;
    var cw = wrap.clientWidth;
    var ch = wrap.clientHeight;

    // Fixed device scale — frame stays constant size
    if (!scale) scale = 0.55;

    canvas.width = cw * devicePixelRatio;
    canvas.height = ch * devicePixelRatio;
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';

    offsetX = (cw - CANVAS_W * scale) / 2;
    offsetY = (ch - CANVAS_H * scale) / 2;
  }

  function getScale() { return scale; }
  function getOffsetX() { return offsetX; }
  function getOffsetY() { return offsetY; }

  // ─── MAIN RENDER ───

  function render(shapes, display, diagonalPanels) {
    var dpr = devicePixelRatio;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Device frame
    drawDeviceFrame();

    // Grid overlay (behind shapes)
    if (display.showGrid) {
      drawGrid(shapes, display.showGridBeyond, display.showPoints);
    }

    // Compute collision knockouts from proximity
    var collisionGap = display.collisionGap !== undefined ? display.collisionGap : 0;
    var collisions = Layouts.computeCollisions(shapes, collisionGap);

    // Shapes — orthogonal or diagonal
    if (diagonalPanels && diagonalPanels.length > 0) {
      drawDiagonalPanels(diagonalPanels, display);
    } else {
      drawShapesWithNotches(shapes, display, collisions);
    }

    // Padding insets (dashed inner rectangles)
    if (display.showPadding) {
      for (var pi = 0; pi < shapes.length; pi++) {
        drawPaddingInsets(shapes[pi]);
      }
    }

    // Annotations (on top of shapes)
    if (display.showGaps) {
      drawGapMarkers(shapes);
    }

    ctx.restore();
  }

  // ─── PADDING VISUALISATION ───
  function drawPaddingInsets(fragment) {
    if (!fragment || fragment.w < 1 || fragment.h < 1) return;
    if (fragment.notch || fragment.chrome) return;
    var p = fragment.padding;
    if (!p) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(100, 255, 150, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(
      fragment.x + p[3],
      fragment.y + p[0],
      fragment.w - p[3] - p[1],
      fragment.h - p[0] - p[2]
    );
    ctx.setLineDash([]);

    // Padding value label (top-left corner, inside the padding area)
    ctx.font = '9px -apple-system, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(100, 255, 150, 0.4)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(p[0] + '/' + p[1] + '/' + p[2] + '/' + p[3],
      fragment.x + p[3] + 4, fragment.y + p[0] + 2);
    ctx.restore();
  }

  // ─── DEVICE FRAME ───

  function drawDeviceFrame() {
    ctx.fillStyle = CHROME_COLOR;
    ctx.beginPath();
    roundedRectPath(ctx, 0, 0, CANVAS_W, CANVAS_H,
      [DEVICE_RADIUS, DEVICE_RADIUS, DEVICE_RADIUS, DEVICE_RADIUS]);
    ctx.fill();

    ctx.strokeStyle = 'rgba(42, 74, 107, 0.40)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    roundedRectPath(ctx, 0, 0, CANVAS_W, CANVAS_H,
      [DEVICE_RADIUS, DEVICE_RADIUS, DEVICE_RADIUS, DEVICE_RADIUS]);
    ctx.stroke();

    var statusY = CHROME_PAD + STATUS_H / 2;

    // Wifi icon
    drawWifiIcon(CHROME_PAD + 20, statusY);
    // Moon icon
    drawMoonIcon(CHROME_PAD + 52, statusY);

    // Home pill
    var pillW = 120;
    var pillH = 5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    roundedRectPath(ctx, CANVAS_W / 2 - pillW / 2, statusY - pillH / 2, pillW, pillH,
      [pillH / 2, pillH / 2, pillH / 2, pillH / 2]);
    ctx.fill();

    // Weather + time
    ctx.fillStyle = STATUS_TEXT;
    ctx.font = '500 13px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('72\u00B0  10:45', CANVAS_W - CHROME_PAD - 20, statusY);

    drawCloudIcon(CANVAS_W - CHROME_PAD - 108, statusY);
  }

  function drawWifiIcon(cx, cy) {
    ctx.save();
    ctx.strokeStyle = STATUS_ICON;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    for (var i = 1; i <= 3; i++) {
      var r = i * 5;
      ctx.beginPath();
      ctx.arc(cx, cy + 6, r, -Math.PI * 0.75, -Math.PI * 0.25);
      ctx.stroke();
    }
    ctx.fillStyle = STATUS_ICON;
    ctx.beginPath();
    ctx.arc(cx, cy + 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawMoonIcon(cx, cy) {
    ctx.save();
    ctx.fillStyle = STATUS_ICON;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx + 4, cy - 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  function drawCloudIcon(cx, cy) {
    ctx.save();
    ctx.fillStyle = STATUS_ICON;
    ctx.beginPath();
    ctx.arc(cx - 3, cy + 1, 4, 0, Math.PI * 2);
    ctx.arc(cx + 3, cy, 5, 0, Math.PI * 2);
    ctx.arc(cx - 1, cy - 3, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ─── VECTOR GRID ───
  // Uniform subtle grid — all lines same colour and weight.
  // Extends beyond device frame on all sides.

  var GRID_COLOR = 'rgba(30, 58, 85, 0.30)';
  var GRID_WIDTH = 0.5;

  function drawGrid(shapes, showBeyond, showPoints) {
    var gridState = VectorGrid.compute(shapes);
    var colW = CANVAS_W / gridState.cols;
    var rowH = CANVAS_H / gridState.rows;

    var extend = 3; // always extend beyond frame

    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = GRID_WIDTH;

    // Vertical lines
    for (var vi = -extend; vi <= gridState.cols + extend; vi++) {
      var vx = vi * colW;
      ctx.beginPath();
      ctx.moveTo(vx, -extend * rowH);
      ctx.lineTo(vx, CANVAS_H + extend * rowH);
      ctx.stroke();
    }

    // Horizontal lines
    for (var hi = -extend; hi <= gridState.rows + extend; hi++) {
      var hy = hi * rowH;
      ctx.beginPath();
      ctx.moveTo(-extend * colW, hy);
      ctx.lineTo(CANVAS_W + extend * colW, hy);
      ctx.stroke();
    }
  }

  // ─── SHAPES (ORTHOGONAL) ───

  // Multi-pass rendering with boolean subtraction for both authored notches
  // and proximity-driven collision knockouts. Uses an offscreen canvas to
  // isolate destination-out compositing from the background/grid.
  function drawShapesWithNotches(shapes, display, collisions) {
    collisions = collisions || [];

    // Separate containers from authored notches
    var containers = [];
    var notches = [];
    for (var i = 0; i < shapes.length; i++) {
      if (shapes[i] && shapes[i].notch) {
        notches.push({ shape: shapes[i], index: i });
      } else {
        containers.push({ shape: shapes[i], index: i });
      }
    }

    // Build set of host indices (fragments that get collision knockouts)
    var hostIndices = {};
    for (var ci = 0; ci < collisions.length; ci++) {
      hostIndices[collisions[ci].hostIndex] = true;
    }

    // Fast path: no notches and no collisions — draw directly
    if (notches.length === 0 && collisions.length === 0) {
      for (var c = 0; c < containers.length; c++) {
        drawShape(containers[c].shape, containers[c].index, display);
      }
      return;
    }

    // Offscreen canvas for boolean compositing
    var offCanvas = document.createElement('canvas');
    offCanvas.width = CANVAS_W;
    offCanvas.height = CANVAS_H;
    var offCtx = offCanvas.getContext('2d');

    // Swap context temporarily
    var mainCtx = ctx;
    ctx = offCtx;

    // Pass 1: draw containers (sorted largest first so hosts draw first)
    var sortedContainers = containers.slice().sort(function (a, b) {
      return (b.shape.w * b.shape.h) - (a.shape.w * a.shape.h);
    });
    for (var c2 = 0; c2 < sortedContainers.length; c2++) {
      drawShape(sortedContainers[c2].shape, sortedContainers[c2].index, display);
    }

    // Pass 2a: cut authored notch holes (expanded by notchOffset)
    for (var n = 0; n < notches.length; n++) {
      var ns = notches[n].shape;
      var off = ns.notchOffset || 8;
      cutNotchHole(ns, off);
    }

    // Pass 2b: cut collision knockout holes
    for (var ck = 0; ck < collisions.length; ck++) {
      var col = collisions[ck];
      var inv = col.invader;
      var knockoutOff = Tokens.gaps.notch; // 8px expansion around invader profile

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.beginPath();
      // Use invader's radii to match its profile
      roundedRectPath(ctx,
        inv.x - knockoutOff, inv.y - knockoutOff,
        inv.w + knockoutOff * 2, inv.h + knockoutOff * 2,
        inv.radii || [Tokens.radii.outer, Tokens.radii.outer, Tokens.radii.outer, Tokens.radii.outer]);
      ctx.fill();
      ctx.restore();

      // Inner highlight along knockout edge
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(120, 160, 240, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      roundedRectPath(ctx,
        inv.x - knockoutOff - 1, inv.y - knockoutOff - 1,
        inv.w + (knockoutOff + 1) * 2, inv.h + (knockoutOff + 1) * 2,
        inv.radii || [Tokens.radii.outer, Tokens.radii.outer, Tokens.radii.outer, Tokens.radii.outer]);
      ctx.stroke();
      ctx.restore();
    }

    // Pass 3: draw authored notch shapes
    for (var n2 = 0; n2 < notches.length; n2++) {
      if (display.showRadii) {
        var nShape = notches[n2].shape;
        if (nShape && nShape.w > 1 && nShape.h > 1) {
          ctx.save();
          ctx.fillStyle = 'rgba(30, 90, 100, 0.95)';
          ctx.beginPath();
          if (nShape.notchShape === 'circle') {
            var nR = Math.min(nShape.w, nShape.h) / 2;
            ctx.arc(nShape.x + nShape.w / 2, nShape.y + nShape.h / 2, nR, 0, Math.PI * 2);
          } else {
            roundedRectPath(ctx, nShape.x, nShape.y, nShape.w, nShape.h, nShape.radii);
          }
          ctx.fill();
          ctx.restore();
          if (display.showRadii) drawCornerLabels(nShape);
          if (display.showDims) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
            ctx.font = '11px -apple-system, system-ui, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText(Math.round(nShape.w) + ' \u00D7 ' + Math.round(nShape.h),
              nShape.x + nShape.w - 12, nShape.y + nShape.h - 10);
          }
        }
      } else {
        drawShape(notches[n2].shape, notches[n2].index, display);
      }
    }

    // Pass 4: notch/collision offset annotations
    if (display.showGaps) {
      for (var n3 = 0; n3 < notches.length; n3++) {
        var ann = notches[n3].shape;
        var annOff = ann.notchOffset || 8;
        drawGapLabel(ann.x - annOff / 2, ann.y + ann.h / 2, annOff + 'px', true);
      }
      // Collision knockout gap annotations
      for (var ck2 = 0; ck2 < collisions.length; ck2++) {
        var col2 = collisions[ck2];
        var kOff = Tokens.gaps.notch;
        var midX = col2.invader.x + col2.invader.w / 2;
        var midY = col2.invader.y + col2.invader.h / 2;
        drawGapLabel(midX, midY, kOff + 'px', col2.edge === 'left' || col2.edge === 'right');
      }
    }

    // Composite offscreen canvas onto main canvas
    ctx = mainCtx;
    ctx.drawImage(offCanvas, 0, 0);
  }

  // Helper: cut a single authored notch hole
  function cutNotchHole(ns, off) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.beginPath();
    if (ns.notchShape === 'circle') {
      var cr = Math.max(ns.w, ns.h) / 2 + off;
      ctx.arc(ns.x + ns.w / 2, ns.y + ns.h / 2, cr, 0, Math.PI * 2);
    } else {
      roundedRectPath(ctx, ns.x - off, ns.y - off,
        ns.w + off * 2, ns.h + off * 2,
        [240, 240, 240, 240]);
    }
    ctx.fill();
    ctx.restore();

    // Inner highlight along cut edge
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(120, 160, 240, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ns.notchShape === 'circle') {
      var hlR = Math.max(ns.w, ns.h) / 2 + off + 1;
      ctx.arc(ns.x + ns.w / 2, ns.y + ns.h / 2, hlR, 0, Math.PI * 2);
    } else {
      roundedRectPath(ctx, ns.x - off - 1, ns.y - off - 1,
        ns.w + (off + 1) * 2, ns.h + (off + 1) * 2,
        [240, 240, 240, 240]);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawShape(shape, index, display) {
    if (!shape || shape.w < 1 || shape.h < 1) return;
    if (shape.opacity !== undefined && shape.opacity < 0.01) return;

    ctx.save();

    if (shape.scale !== undefined && shape.scale !== 1) {
      var cx = shape.x + shape.w / 2;
      var cy = shape.y + shape.h / 2;
      ctx.translate(cx, cy);
      ctx.scale(shape.scale, shape.scale);
      ctx.translate(-cx, -cy);
    }

    if (shape.opacity !== undefined && shape.opacity < 1) {
      ctx.globalAlpha = shape.opacity;
    }

    // Solid fill
    ctx.fillStyle = SHAPE_FILLS[index % SHAPE_FILLS.length];
    ctx.beginPath();
    roundedRectPath(ctx, shape.x, shape.y, shape.w, shape.h, shape.radii);
    ctx.fill();

    // Subtle top highlight
    ctx.save();
    ctx.beginPath();
    roundedRectPath(ctx, shape.x, shape.y, shape.w, shape.h, shape.radii);
    ctx.clip();
    ctx.strokeStyle = 'rgba(100, 140, 220, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(shape.x + shape.radii[0], shape.y + 0.5);
    ctx.lineTo(shape.x + shape.w - shape.radii[1], shape.y + 0.5);
    ctx.stroke();
    ctx.restore();

    // Corner radii labels
    if (display.showRadii) {
      drawCornerLabels(shape);
    }

    // Dimension labels
    if (display.showDims) {
      var dimText = Math.round(shape.w) + ' \u00D7 ' + Math.round(shape.h);
      ctx.font = '11px -apple-system, system-ui, sans-serif';
      var dimW = ctx.measureText(dimText).width;
      // Background
      ctx.fillStyle = 'rgba(0, 10, 30, 0.5)';
      ctx.beginPath();
      roundedRectPath(ctx, shape.x + shape.w - dimW - 18, shape.y + shape.h - 24, dimW + 8, 16, [3, 3, 3, 3]);
      ctx.fill();
      // Text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(dimText, shape.x + shape.w - 14, shape.y + shape.h - 10);
    }

    ctx.restore();
  }

  function drawCornerLabels(shape) {
    var corners = [
      { x: shape.x + 16, y: shape.y + 18, r: shape.radii[0], align: 'left', baseline: 'top' },
      { x: shape.x + shape.w - 16, y: shape.y + 18, r: shape.radii[1], align: 'right', baseline: 'top' },
      { x: shape.x + shape.w - 16, y: shape.y + shape.h - 14, r: shape.radii[2], align: 'right', baseline: 'bottom' },
      { x: shape.x + 16, y: shape.y + shape.h - 14, r: shape.radii[3], align: 'left', baseline: 'bottom' }
    ];

    for (var c = 0; c < corners.length; c++) {
      var corner = corners[c];
      var val = Math.round(corner.r);
      var isOuter = val >= 60;
      var text = val + 'px';

      ctx.font = (isOuter ? 'bold ' : '') + '12px -apple-system, system-ui, sans-serif';
      var tw = ctx.measureText(text).width;

      // Background pill for contrast
      var bgX = corner.align === 'left' ? corner.x - 3 : corner.x - tw - 3;
      var bgY = corner.baseline === 'top' ? corner.y - 2 : corner.y - 14;
      ctx.fillStyle = 'rgba(0, 10, 30, 0.6)';
      ctx.beginPath();
      roundedRectPath(ctx, bgX, bgY, tw + 6, 16, [3, 3, 3, 3]);
      ctx.fill();

      ctx.fillStyle = isOuter ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 200, 100, 0.65)';
      ctx.textAlign = corner.align;
      ctx.textBaseline = corner.baseline;
      ctx.fillText(text, corner.x, corner.y);
    }
  }

  // ─── GAP MARKERS ───

  function drawGapMarkers(shapes) {
    for (var i = 0; i < shapes.length; i++) {
      for (var j = i + 1; j < shapes.length; j++) {
        var a = shapes[i];
        var b = shapes[j];
        if (!a || !b || a.w < 1 || b.w < 1) continue;

        // Horizontal gap (a is left of b)
        var overlapY = a.y < b.y + b.h && a.y + a.h > b.y;
        if (overlapY) {
          var gapH = b.x - (a.x + a.w);
          if (gapH > 0 && gapH < 60) {
            var midX = a.x + a.w + gapH / 2;
            var midY = Math.max(a.y, b.y) + (Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)) / 2;
            drawGapLabel(midX, midY, Math.round(gapH) + 'px', true);
          }
          // Reversed
          var gapH2 = a.x - (b.x + b.w);
          if (gapH2 > 0 && gapH2 < 60) {
            var midX2 = b.x + b.w + gapH2 / 2;
            var midY2 = Math.max(a.y, b.y) + (Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)) / 2;
            drawGapLabel(midX2, midY2, Math.round(gapH2) + 'px', true);
          }
        }

        // Vertical gap (a is above b)
        var overlapX = a.x < b.x + b.w && a.x + a.w > b.x;
        if (overlapX) {
          var gapV = b.y - (a.y + a.h);
          if (gapV > 0 && gapV < 60) {
            var midX3 = Math.max(a.x, b.x) + (Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) / 2;
            var midY3 = a.y + a.h + gapV / 2;
            drawGapLabel(midX3, midY3, Math.round(gapV) + 'px', false);
          }
          // Reversed
          var gapV2 = a.y - (b.y + b.h);
          if (gapV2 > 0 && gapV2 < 60) {
            var midX4 = Math.max(a.x, b.x) + (Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) / 2;
            var midY4 = b.y + b.h + gapV2 / 2;
            drawGapLabel(midX4, midY4, Math.round(gapV2) + 'px', false);
          }
        }
      }
    }
  }

  function drawGapLabel(x, y, text, horizontal) {
    ctx.font = 'bold 11px -apple-system, system-ui, sans-serif';
    var tw = ctx.measureText(text).width;
    var pw = Math.max(tw + 10, 34);

    // Background pill
    ctx.fillStyle = 'rgba(0, 10, 30, 0.7)';
    ctx.beginPath();
    roundedRectPath(ctx, x - pw / 2, y - 9, pw, 18, [4, 4, 4, 4]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    roundedRectPath(ctx, x - pw / 2, y - 9, pw, 18, [4, 4, 4, 4]);
    ctx.stroke();

    // Text
    ctx.fillStyle = 'rgba(255, 200, 100, 0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);

    // Small arrows
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.35)';
    ctx.lineWidth = 1;
    if (horizontal) {
      // Vertical line through the gap
      ctx.beginPath();
      ctx.moveTo(x, y - 20);
      ctx.lineTo(x, y - 10);
      ctx.moveTo(x, y + 10);
      ctx.lineTo(x, y + 20);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x - 20, y);
      ctx.lineTo(x - 10, y);
      ctx.moveTo(x + 10, y);
      ctx.lineTo(x + 20, y);
      ctx.stroke();
    }
  }

  // ─── DIAGONAL PANELS ───

  function drawDiagonalPanels(panels, display) {
    for (var i = 0; i < panels.length; i++) {
      var panel = panels[i];

      ctx.save();

      // Clip to the diagonal polygon
      ctx.beginPath();
      ctx.moveTo(panel.clipPoints[0].x, panel.clipPoints[0].y);
      for (var p = 1; p < panel.clipPoints.length; p++) {
        ctx.lineTo(panel.clipPoints[p].x, panel.clipPoints[p].y);
      }
      ctx.closePath();
      ctx.clip();

      // Draw a large rounded rect that fills the clipped area
      var b = panel.bounds;
      var r = R_OUTER;
      ctx.fillStyle = SHAPE_FILLS[i % SHAPE_FILLS.length];
      ctx.beginPath();
      roundedRectPath(ctx, b.x - r, b.y, b.w + r * 2, b.h, [r, r, r, r]);
      ctx.fill();

      // Top highlight
      ctx.strokeStyle = 'rgba(100, 140, 220, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(panel.clipPoints[0].x + 20, panel.clipPoints[0].y + 0.5);
      ctx.lineTo(panel.clipPoints[1].x - 20, panel.clipPoints[1].y + 0.5);
      ctx.stroke();

      ctx.restore();
    }
  }

  // ─── ROUNDED RECT ───

  function roundedRectPath(ctx, x, y, w, h, radii) {
    var tl = Math.min(Math.max(radii[0], 0), w / 2, h / 2);
    var tr = Math.min(Math.max(radii[1], 0), w / 2, h / 2);
    var br = Math.min(Math.max(radii[2], 0), w / 2, h / 2);
    var bl = Math.min(Math.max(radii[3], 0), w / 2, h / 2);

    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y);
    ctx.arcTo(x + w, y, x + w, y + tr, tr);
    ctx.lineTo(x + w, y + h - br);
    ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
    ctx.lineTo(x + bl, y + h);
    ctx.arcTo(x, y + h, x, y + h - bl, bl);
    ctx.lineTo(x, y + tl);
    ctx.arcTo(x, y, x + tl, y, tl);
    ctx.closePath();
  }

  // ─── ORGANIC KNOCKOUT ───
  // Single compound path that traces the container outline and detours
  // inward around a circular notch with smooth fillet transitions.
  // Replaces the destination-out boolean subtraction approach.

  function renderOrganic(scene, display) {
    var dpr = devicePixelRatio;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Device frame
    drawDeviceFrame();

    // Container with organic knockout
    ctx.fillStyle = SHAPE_FILLS[0];
    ctx.beginPath();
    organicKnockoutPath(ctx, scene.container, scene.circle,
      scene.notchOffset, scene.rOrganic, scene.rBase);
    ctx.fill();

    // Subtle top highlight on container
    ctx.save();
    ctx.beginPath();
    organicKnockoutPath(ctx, scene.container, scene.circle,
      scene.notchOffset, scene.rOrganic, scene.rBase);
    ctx.clip();
    ctx.strokeStyle = 'rgba(100, 140, 220, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scene.container.x + scene.rBase, scene.container.y + 0.5);
    // Top highlight stops before the fillet
    var rCut = scene.circle.r + scene.notchOffset;
    var dyTop = scene.container.y - scene.circle.cy;
    var topStopX = scene.circle.cx;
    if (Math.abs(dyTop) < rCut) {
      topStopX = scene.circle.cx - Math.sqrt(rCut * rCut - dyTop * dyTop) - scene.rOrganic;
    }
    ctx.lineTo(Math.min(topStopX, scene.container.x + scene.container.w - scene.rBase), scene.container.y + 0.5);
    ctx.stroke();
    ctx.restore();

    // Inner highlight along the cut edge — clipped to container
    ctx.save();
    ctx.beginPath();
    roundedRectPath(ctx, scene.container.x, scene.container.y,
      scene.container.w, scene.container.h,
      [scene.rBase, scene.rBase, scene.rBase, scene.rBase]);
    ctx.clip();
    ctx.strokeStyle = 'rgba(120, 160, 240, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(scene.circle.cx, scene.circle.cy, rCut + 1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Circle (notch shape) — deformed where it meets container edges
    // Both shapes squeeze equally at the contact zone (mutual deformation)
    ctx.fillStyle = SHAPE_FILLS[1];
    ctx.beginPath();
    drawDeformedCircle(ctx, scene.circle.cx, scene.circle.cy, scene.circle.r,
      scene.container, scene.rOrganic, scene.notchOffset);
    ctx.fill();

    // Circle highlight (deformed path)
    ctx.strokeStyle = 'rgba(100, 140, 220, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    drawDeformedCircle(ctx, scene.circle.cx, scene.circle.cy, scene.circle.r - 0.5,
      scene.container, scene.rOrganic, scene.notchOffset);
    ctx.stroke();

    // Grid overlay — on top of shapes
    if (display.showGrid) {
      var gridShapes = [
        { x: scene.container.x, y: scene.container.y,
          w: scene.container.w, h: scene.container.h }
      ];
      drawGrid(gridShapes, display.showGridBeyond, display.showPoints);
    }

    // Annotations
    if (display.showRadii) {
      // Container corner labels
      var cr = scene.rBase;
      var corners = [
        { x: scene.container.x + 16, y: scene.container.y + 18, r: cr, align: 'left', baseline: 'top' },
        { x: scene.container.x + scene.container.w - 16, y: scene.container.y + scene.container.h - 14, r: cr, align: 'right', baseline: 'bottom' },
        { x: scene.container.x + 16, y: scene.container.y + scene.container.h - 14, r: cr, align: 'left', baseline: 'bottom' }
      ];
      for (var ci = 0; ci < corners.length; ci++) {
        drawOrganicLabel(corners[ci].x, corners[ci].y, Math.round(corners[ci].r) + 'px',
          corners[ci].align, corners[ci].baseline, false);
      }
      // Organic radius label near the fillet
      var orgLabelX = scene.circle.cx - scene.circle.r - scene.rOrganic * 0.5;
      var orgLabelY = scene.circle.cy + scene.circle.r * 0.5;
      drawOrganicLabel(orgLabelX, orgLabelY,
        'organic ' + Math.round(scene.rOrganic) + 'px', 'center', 'top', true);
      // Circle radius label (centred in circle)
      var rLabelX = scene.circle.cx;
      var rLabelY = scene.circle.cy;
      drawOrganicLabel(rLabelX, rLabelY,
        'r' + Math.round(scene.circle.r), 'center', 'middle', true);
    }

    if (display.showGaps) {
      // Notch offset annotation (inside the visible area)
      var gapLabelX = scene.circle.cx - scene.circle.r - scene.notchOffset / 2;
      var gapLabelY = scene.circle.cy + scene.circle.r * 0.5;
      drawGapLabel(gapLabelX, gapLabelY, scene.notchOffset + 'px', true);
    }

    if (display.showDims) {
      var dimText = Math.round(scene.container.w) + ' \u00D7 ' + Math.round(scene.container.h);
      ctx.font = '11px -apple-system, system-ui, sans-serif';
      var dimW = ctx.measureText(dimText).width;
      ctx.fillStyle = 'rgba(0, 10, 30, 0.5)';
      ctx.beginPath();
      roundedRectPath(ctx, scene.container.x + scene.container.w - dimW - 18,
        scene.container.y + scene.container.h - 24, dimW + 8, 16, [3, 3, 3, 3]);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(dimText, scene.container.x + scene.container.w - 14,
        scene.container.y + scene.container.h - 10);
    }

    ctx.restore();
  }

  function drawOrganicLabel(x, y, text, align, baseline, accent) {
    ctx.font = (accent ? 'bold ' : '') + '12px -apple-system, system-ui, sans-serif';
    var tw = ctx.measureText(text).width;
    var bgX = align === 'left' ? x - 3 : align === 'right' ? x - tw - 3 : x - tw / 2 - 3;
    var bgY = baseline === 'top' ? y - 2 : baseline === 'bottom' ? y - 14 : y - 8;
    ctx.fillStyle = 'rgba(0, 10, 30, 0.6)';
    ctx.beginPath();
    roundedRectPath(ctx, bgX, bgY, tw + 6, 16, [3, 3, 3, 3]);
    ctx.fill();
    ctx.fillStyle = accent ? 'rgba(100, 255, 150, 0.7)' : 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
  }

  // ─── COMPOUND PATH: container with organic circular cutout ───
  //
  // Traces the container outline clockwise, detouring inward around the
  // circle with smooth fillet arcs at the transition points.
  //
  // For a circle at the top-right area:
  //   top edge → fillet arc → circle arc (concave, CCW) → fillet arc → right edge
  //
  // The fillet arcs are tangent to both the straight edge and the cut circle,
  // creating a smooth tangent-continuous transition.

  function organicKnockoutPath(ctx, rect, circle, notchOffset, rOrganic, rBase) {
    var rCut = circle.r + notchOffset;
    var cx = circle.cx;
    var cy = circle.cy;

    // Check if circle actually intersects the container edges
    var topEdge = rect.y;
    var rightEdge = rect.x + rect.w;
    var bottomEdge = rect.y + rect.h;
    var leftEdge = rect.x;

    // Does the cut circle cross the top edge?
    var dyTop = topEdge - cy;
    var crossesTop = Math.abs(dyTop) < rCut && cx > leftEdge && cx <= rightEdge;

    // Does the cut circle cross the right edge?
    var dxRight = rightEdge - cx;
    var crossesRight = Math.abs(dxRight) < rCut && cy >= topEdge && cy < bottomEdge;

    // If no intersection, draw a standard rounded rect
    if (!crossesTop && !crossesRight) {
      roundedRectPath(ctx, rect.x, rect.y, rect.w, rect.h,
        [rBase, rBase, rBase, rBase]);
      return;
    }

    // Clamp organic radius to avoid degenerate geometry
    var rF = Math.max(0, Math.min(rOrganic, rCut * 0.8));

    // ── Compute fillet for TOP edge ──
    var topFillet = null;
    if (crossesTop) {
      topFillet = computeTopFillet(rect, cx, cy, rCut, rF);
    }

    // ── Compute fillet for RIGHT edge ──
    var rightFillet = null;
    if (crossesRight) {
      rightFillet = computeRightFillet(rect, cx, cy, rCut, rF);
    }

    // ── Build the path ──
    // Start from top-left corner
    ctx.moveTo(leftEdge + rBase, topEdge);

    if (topFillet && rightFillet) {
      // Top edge → left fillet → circle arc → right fillet → right edge
      ctx.lineTo(topFillet.edgeTangent.x, topFillet.edgeTangent.y);

      // Left fillet arc: from edge tangent to circle tangent
      ctx.arc(topFillet.centre.x, topFillet.centre.y, rF,
        topFillet.startAngle, topFillet.endAngle, false);

      // Concave circle arc: from left fillet's circle tangent to right fillet's circle tangent
      var circArcStart = Math.atan2(topFillet.circleTangent.y - cy, topFillet.circleTangent.x - cx);
      var circArcEnd = Math.atan2(rightFillet.circleTangent.y - cy, rightFillet.circleTangent.x - cx);
      ctx.arc(cx, cy, rCut, circArcStart, circArcEnd, true); // CCW = concave

      // Right fillet arc: from circle tangent to edge tangent
      ctx.arc(rightFillet.centre.x, rightFillet.centre.y, rF,
        rightFillet.startAngle, rightFillet.endAngle, false);

      // Continue down the right edge
      ctx.lineTo(rightEdge, bottomEdge - rBase);
    } else if (topFillet) {
      // Circle only crosses top, not right — simplified
      ctx.lineTo(topFillet.edgeTangent.x, topFillet.edgeTangent.y);
      ctx.arc(topFillet.centre.x, topFillet.centre.y, rF,
        topFillet.startAngle, topFillet.endAngle, false);
      // Arc back to the top-right corner area
      var trAngle = Math.atan2(topEdge - cy, rightEdge - cx);
      ctx.arc(cx, cy, rCut, Math.atan2(topFillet.circleTangent.y - cy, topFillet.circleTangent.x - cx), trAngle, true);
      ctx.lineTo(rightEdge, topEdge);
      ctx.lineTo(rightEdge, bottomEdge - rBase);
    } else {
      // Standard top-right corner
      ctx.lineTo(rightEdge - rBase, topEdge);
      ctx.arcTo(rightEdge, topEdge, rightEdge, topEdge + rBase, rBase);
      ctx.lineTo(rightEdge, bottomEdge - rBase);
    }

    // Bottom-right corner (standard)
    ctx.arcTo(rightEdge, bottomEdge, rightEdge - rBase, bottomEdge, rBase);

    // Bottom edge
    ctx.lineTo(leftEdge + rBase, bottomEdge);

    // Bottom-left corner (standard)
    ctx.arcTo(leftEdge, bottomEdge, leftEdge, bottomEdge - rBase, rBase);

    // Left edge
    ctx.lineTo(leftEdge, topEdge + rBase);

    // Top-left corner (standard)
    ctx.arcTo(leftEdge, topEdge, leftEdge + rBase, topEdge, rBase);

    ctx.closePath();
  }

  // Compute fillet where cut circle meets the TOP edge of the container
  function computeTopFillet(rect, cx, cy, rCut, rF) {
    var topEdge = rect.y;

    // Fillet centre is rF below the top edge
    var fcy = topEdge + rF;

    // Distance from fillet centre to cut centre must equal rCut + rF
    var distNeeded = rCut + rF;
    var dy = fcy - cy;
    var dxSq = distNeeded * distNeeded - dy * dy;
    if (dxSq < 0) return null; // No valid fillet

    // Take the leftward solution (fillet is to the left of the circle)
    var fcx = cx - Math.sqrt(dxSq);

    // Tangent point on the top edge: directly above fillet centre
    var edgeTangent = { x: fcx, y: topEdge };

    // Tangent point on the cut circle: along vector from cut centre to fillet centre
    var vx = fcx - cx;
    var vy = fcy - cy;
    var vLen = Math.sqrt(vx * vx + vy * vy);
    var circleTangent = {
      x: cx + vx * rCut / vLen,
      y: cy + vy * rCut / vLen
    };

    // Arc angles for the fillet (CW from edge tangent to circle tangent)
    var startAngle = Math.atan2(edgeTangent.y - fcy, edgeTangent.x - fcx); // = -PI/2
    var endAngle = Math.atan2(circleTangent.y - fcy, circleTangent.x - fcx);

    return {
      centre: { x: fcx, y: fcy },
      edgeTangent: edgeTangent,
      circleTangent: circleTangent,
      startAngle: startAngle,
      endAngle: endAngle
    };
  }

  // Compute fillet where cut circle meets the RIGHT edge of the container
  function computeRightFillet(rect, cx, cy, rCut, rF) {
    var rightEdge = rect.x + rect.w;

    // Fillet centre is rF to the left of the right edge
    var fcx = rightEdge - rF;

    // Distance from fillet centre to cut centre must equal rCut + rF
    var distNeeded = rCut + rF;
    var dx = fcx - cx;
    var dySq = distNeeded * distNeeded - dx * dx;
    if (dySq < 0) return null; // No valid fillet

    // Take the downward solution (fillet is below the circle)
    var fcy = cy + Math.sqrt(dySq);

    // Tangent point on the right edge: directly right of fillet centre
    var edgeTangent = { x: rightEdge, y: fcy };

    // Tangent point on the cut circle: along vector from cut centre to fillet centre
    var vx = fcx - cx;
    var vy = fcy - cy;
    var vLen = Math.sqrt(vx * vx + vy * vy);
    var circleTangent = {
      x: cx + vx * rCut / vLen,
      y: cy + vy * rCut / vLen
    };

    // Arc angles for the fillet (CW from circle tangent to edge tangent)
    var startAngle = Math.atan2(circleTangent.y - fcy, circleTangent.x - fcx);
    var endAngle = Math.atan2(edgeTangent.y - fcy, edgeTangent.x - fcx); // = 0

    return {
      centre: { x: fcx, y: fcy },
      edgeTangent: edgeTangent,
      circleTangent: circleTangent,
      startAngle: startAngle,
      endAngle: endAngle
    };
  }

  // ─── SDF FUNCTIONS ───
  // Signed Distance Fields for shape deformation (Inigo Quilez)

  function sdfRoundedRect(px, py, rect) {
    var cx = rect.x + rect.w / 2;
    var cy = rect.y + rect.h / 2;
    var halfW = rect.w / 2;
    var halfH = rect.h / 2;
    var r = rect.cornerRadius || 0;

    var dx = Math.abs(px - cx) - halfW + r;
    var dy = Math.abs(py - cy) - halfH + r;

    var outsideDist = Math.sqrt(
      Math.max(dx, 0) * Math.max(dx, 0) +
      Math.max(dy, 0) * Math.max(dy, 0)
    );
    var insideDist = Math.min(Math.max(dx, dy), 0);

    return outsideDist + insideDist - r;
  }

  function sdfCircle(px, py, circle) {
    var dx = px - circle.cx;
    var dy = py - circle.cy;
    return Math.sqrt(dx * dx + dy * dy) - circle.r;
  }

  // ─── DEFORMED SHAPE ───
  // SDF-based mutual deformation using smooth subtraction (Quilez).
  // Samples the shape boundary, computes displacement from nearby shapes,
  // and pushes points inward along surface normals.

  function drawDeformedCircle(ctx, cx, cy, r, container, rOrganic, notchOffset) {
    var SAMPLES = 64;
    var collisionGap = rOrganic; // fillet radius acts as the smooth-sub k parameter
    var containerRect = {
      x: container.x, y: container.y,
      w: container.w, h: container.h,
      cornerRadius: notchOffset > 0 ? notchOffset : 0
    };

    var points = [];
    for (var i = 0; i < SAMPLES; i++) {
      var angle = (i / SAMPLES) * Math.PI * 2;
      var px = cx + Math.cos(angle) * r;
      var py = cy + Math.sin(angle) * r;

      // SDF distance from this boundary point to the container
      var d = sdfRoundedRect(px, py, containerRect);

      // Smooth subtraction displacement (Quilez formula)
      var totalInset = 0;
      if (d < collisionGap && d > -collisionGap) {
        var h = Math.max(0, Math.min(1, 0.5 - 0.5 * d / collisionGap));
        totalInset = collisionGap * h * (1 - h);
      }

      if (totalInset > 0) {
        px = cx + Math.cos(angle) * (r - totalInset);
        py = cy + Math.sin(angle) * (r - totalInset);
      }

      points.push({ x: px, y: py });
    }

    // Render with quadratic bezier segments for smoothness
    ctx.moveTo(points[0].x, points[0].y);
    for (var j = 0; j < SAMPLES; j++) {
      var curr = points[j];
      var next = points[(j + 1) % SAMPLES];
      var midX = (curr.x + next.x) / 2;
      var midY = (curr.y + next.y) / 2;
      ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
    }
    ctx.closePath();
  }

  return {
    init: init,
    resize: resize,
    render: render,
    renderOrganic: renderOrganic,
    getScale: getScale,
    getOffsetX: getOffsetX,
    getOffsetY: getOffsetY
  };
})();
