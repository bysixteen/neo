// Canvas 2D renderer — Alexa Neo-EDL Structure Lab
// Navy monochrome palette, solid edges, device chrome, grid overlay, annotations

var Renderer = (function () {
  var canvas, ctx;
  var scale = 1;
  var offsetX = 0;
  var offsetY = 0;

  // Navy monochrome palette
  var SHAPE_FILLS = [
    'rgba(42, 58, 90, 0.95)',
    'rgba(48, 65, 100, 0.95)',
    'rgba(38, 54, 85, 0.95)',
    'rgba(55, 72, 110, 0.95)',
    'rgba(45, 62, 95, 0.95)',
    'rgba(50, 68, 105, 0.95)'
  ];

  var BG_COLOR = '#0d1520';
  var CHROME_COLOR = '#0f1a2a';
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

    // Shapes — orthogonal or diagonal
    if (diagonalPanels && diagonalPanels.length > 0) {
      drawDiagonalPanels(diagonalPanels, display);
    } else {
      drawShapesWithNotches(shapes, display);
    }

    // Annotations (on top of shapes)
    if (display.showGaps) {
      drawGapMarkers(shapes);
    }

    ctx.restore();
  }

  // ─── DEVICE FRAME ───

  function drawDeviceFrame() {
    ctx.fillStyle = CHROME_COLOR;
    ctx.beginPath();
    roundedRectPath(ctx, 0, 0, CANVAS_W, CANVAS_H,
      [DEVICE_RADIUS, DEVICE_RADIUS, DEVICE_RADIUS, DEVICE_RADIUS]);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
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

  // ─── CIRCLE GRID ───
  // The EDL grid uses circles arranged in a regular pattern.
  // Shapes sit on top; circles are visible through the gaps.

  function drawGrid(shapes, showBeyond, showPoints) {
    var gridState = VectorGrid.compute(shapes);
    var colW = CW / gridState.cols;
    var rowH = CH / gridState.rows;
    var circleR = Math.min(colW, rowH) * 0.38; // circle size relative to cell

    var extend = showBeyond ? 1 : 0; // extra rows/cols beyond frame

    // Draw circles at each grid intersection
    for (var ci = -extend; ci <= gridState.cols + extend; ci++) {
      for (var cj = -extend; cj <= gridState.rows + extend; cj++) {
        var cx = CX + ci * colW + colW / 2;
        var cy = CY + cj * rowH + rowH / 2;

        // Check if this circle is inside any shape (occluded)
        var occluded = false;
        for (var s = 0; s < shapes.length; s++) {
          var sh = shapes[s];
          if (sh && sh.w > 1 && cx > sh.x && cx < sh.x + sh.w && cy > sh.y && cy < sh.y + sh.h) {
            occluded = true;
            break;
          }
        }

        // Check if near an attached grid line
        var nearAttached = false;
        for (var vi = 0; vi < gridState.vertical.length; vi++) {
          if (gridState.vertical[vi].attached && Math.abs(cx - gridState.vertical[vi].x) < colW * 0.6) {
            nearAttached = true;
            break;
          }
        }
        if (!nearAttached) {
          for (var hj = 0; hj < gridState.horizontal.length; hj++) {
            if (gridState.horizontal[hj].attached && Math.abs(cy - gridState.horizontal[hj].y) < rowH * 0.6) {
              nearAttached = true;
              break;
            }
          }
        }

        var alpha = occluded ? 0.03 : (nearAttached ? 0.12 : 0.06);

        ctx.fillStyle = 'rgba(100, 160, 255, ' + alpha + ')';
        ctx.beginPath();
        ctx.arc(cx, cy, circleR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Attachment point labels at grid intersections
    if (showPoints) {
      ctx.font = '8px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (var pi = 0; pi < gridState.vertical.length; pi++) {
        for (var pj = 0; pj < gridState.horizontal.length; pj++) {
          var vl = gridState.vertical[pi];
          var hl = gridState.horizontal[pj];

          if (vl.attached && hl.attached) {
            ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(vl.x, hl.y, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
            ctx.fillText(pi + ',' + pj, vl.x, hl.y - 10);
          }
        }
      }
    }
  }

  // ─── SHAPES (ORTHOGONAL) ───

  // Two-pass rendering: containers first, then boolean-subtract notch holes,
  // then draw notch shapes. Uses an offscreen canvas to isolate the
  // destination-out compositing from the background/grid.
  function drawShapesWithNotches(shapes, display) {
    // Separate containers from notches
    var containers = [];
    var notches = [];
    for (var i = 0; i < shapes.length; i++) {
      if (shapes[i] && shapes[i].notch) {
        notches.push({ shape: shapes[i], index: i });
      } else {
        containers.push({ shape: shapes[i], index: i });
      }
    }

    // If no notches, draw directly (fast path)
    if (notches.length === 0) {
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

    // Pass 1: draw containers
    for (var c2 = 0; c2 < containers.length; c2++) {
      drawShape(containers[c2].shape, containers[c2].index, display);
    }

    // Pass 2: cut notch holes (expanded by notchOffset)
    for (var n = 0; n < notches.length; n++) {
      var ns = notches[n].shape;
      var off = ns.notchOffset || 8;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.beginPath();
      if (ns.notchShape === 'circle') {
        // Circle cut-out expanded by offset
        var cr = Math.max(ns.w, ns.h) / 2 + off;
        ctx.arc(ns.x + ns.w / 2, ns.y + ns.h / 2, cr, 0, Math.PI * 2);
      } else {
        // Rect cut-out with 240px radius, expanded by offset
        roundedRectPath(ctx, ns.x - off, ns.y - off,
          ns.w + off * 2, ns.h + off * 2,
          [240, 240, 240, 240]);
      }
      ctx.fill();
      ctx.restore();
    }

    // Pass 3: draw notch shapes
    for (var n2 = 0; n2 < notches.length; n2++) {
      drawShape(notches[n2].shape, notches[n2].index, display);
    }

    // Composite offscreen canvas onto main canvas
    ctx = mainCtx;
    ctx.drawImage(offCanvas, 0, 0);
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
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.font = '10px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(
        Math.round(shape.w) + ' \u00D7 ' + Math.round(shape.h),
        shape.x + shape.w - 12,
        shape.y + shape.h - 10
      );
    }

    ctx.restore();
  }

  function drawCornerLabels(shape) {
    var corners = [
      { x: shape.x + 14, y: shape.y + 16, r: shape.radii[0], align: 'left', baseline: 'top' },
      { x: shape.x + shape.w - 14, y: shape.y + 16, r: shape.radii[1], align: 'right', baseline: 'top' },
      { x: shape.x + shape.w - 14, y: shape.y + shape.h - 12, r: shape.radii[2], align: 'right', baseline: 'bottom' },
      { x: shape.x + 14, y: shape.y + shape.h - 12, r: shape.radii[3], align: 'left', baseline: 'bottom' }
    ];

    for (var c = 0; c < corners.length; c++) {
      var corner = corners[c];
      var val = Math.round(corner.r);
      var isOuter = val >= 60; // rough threshold

      ctx.fillStyle = isOuter ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 200, 100, 0.4)';
      ctx.font = (isOuter ? 'bold ' : '') + '10px -apple-system, system-ui, sans-serif';
      ctx.textAlign = corner.align;
      ctx.textBaseline = corner.baseline;
      ctx.fillText(val + 'px', corner.x, corner.y);
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
    // Background pill
    ctx.fillStyle = 'rgba(255, 180, 60, 0.15)';
    var tw = ctx.measureText ? 28 : 28;
    ctx.beginPath();
    roundedRectPath(ctx, x - 16, y - 8, 32, 16, [4, 4, 4, 4]);
    ctx.fill();

    // Text
    ctx.fillStyle = 'rgba(255, 200, 100, 0.7)';
    ctx.font = 'bold 9px -apple-system, system-ui, sans-serif';
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

  return {
    init: init,
    resize: resize,
    render: render,
    getScale: getScale,
    getOffsetX: getOffsetX,
    getOffsetY: getOffsetY
  };
})();
