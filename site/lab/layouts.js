// Layout presets — Neo-EDL Smart Fragment layouts
// Each preset returns a SmartFragment array with tokenised padding,
// relationship metadata, and notch eligibility based on action hierarchy.

var Layouts = (function () {

  // ─── NOTCH ELIGIBILITY ───
  // Notch only when fragment area > 25% of canvas and has an action type

  function isNotchEligible(fragment) {
    var cat = fragment.sizeCategory || computeSizeCategory(fragment);
    if (cat === Tokens.SIZE_QUARTER) return false;
    if (fragment.actionType === Tokens.ACTION_NONE) return false;
    return true;
  }

  function selectNotchSize(fragment) {
    if (!isNotchEligible(fragment)) return null;
    if (fragment.actionType === Tokens.ACTION_PRIMARY) return 'large';
    if (fragment.actionType === Tokens.ACTION_SECONDARY) return 'small';
    return null;
  }

  // ─── AUTO CORNER RADIUS ───
  // Uses fragment relationship to determine gap tolerance and radius values.
  // Associated neighbours get tighter gaps and inner radii.

  function assignRadii(fragments, gap, rOuter, rInner) {
    var tolerance = gap + 4;

    for (var i = 0; i < fragments.length; i++) {
      var s = fragments[i];
      if (s.notch) continue; // notch radii set explicitly
      var hasRight = false, hasLeft = false, hasAbove = false, hasBelow = false;

      for (var j = 0; j < fragments.length; j++) {
        if (i === j) continue;
        var o = fragments[j];

        var overlapY = s.y < o.y + o.h && s.y + s.h > o.y;
        var overlapX = s.x < o.x + o.w && s.x + s.w > o.x;

        if (overlapY) {
          if (Math.abs((s.x + s.w) - o.x) < tolerance) hasRight = true;
          if (Math.abs(s.x - (o.x + o.w)) < tolerance) hasLeft = true;
        }
        if (overlapX) {
          if (Math.abs((s.y + s.h) - o.y) < tolerance) hasBelow = true;
          if (Math.abs(s.y - (o.y + o.h)) < tolerance) hasAbove = true;
        }
      }

      s.radii[0] = (hasAbove || hasLeft) ? rInner : rOuter;
      s.radii[1] = (hasAbove || hasRight) ? rInner : rOuter;
      s.radii[2] = (hasBelow || hasRight) ? rInner : rOuter;
      s.radii[3] = (hasBelow || hasLeft) ? rInner : rOuter;
    }

    return fragments;
  }

  // ─── HELPER: apply size categories to all fragments ───

  function applySizeCategories(fragments) {
    for (var i = 0; i < fragments.length; i++) {
      if (!fragments[i].notch) {
        fragments[i].sizeCategory = computeSizeCategory(fragments[i]);
      }
    }
    return fragments;
  }

  // ─── PRESET DEFINITIONS ───

  function fullStage(p) {
    var cb = contentBounds();
    return applySizeCategories([
      SmartFragment(cb.x, cb.y, cb.w, cb.h, {
        relationship: 'disassociated',
        padding: [Tokens.spacing.lg, Tokens.spacing.lg, Tokens.spacing.lg, Tokens.spacing.lg]
      })
    ]);
  }

  function twoPanel(p) {
    var cb = contentBounds();
    var leftW = Math.floor((cb.w - p.gap) * 0.55);
    var rightW = cb.w - leftW - p.gap;
    var fragments = [
      SmartFragment(cb.x, cb.y, leftW, cb.h, {
        relationship: 'associated',
        padding: [Tokens.spacing.md, Tokens.spacing.sm, Tokens.spacing.md, Tokens.spacing.md]
      }),
      SmartFragment(cb.x + leftW + p.gap, cb.y, rightW, cb.h, {
        relationship: 'associated',
        padding: [Tokens.spacing.md, Tokens.spacing.md, Tokens.spacing.md, Tokens.spacing.sm]
      })
    ];
    applySizeCategories(fragments);
    return assignRadii(fragments, p.gap, p.rOuter, p.rInner);
  }

  function threePanel(p) {
    var cb = contentBounds();
    var w1 = Math.floor(cb.w * 0.45);
    var w2 = Math.floor(cb.w * 0.33);
    var w3 = cb.w - w1 - w2 - p.gap * 2;
    var x1 = cb.x;
    var x2 = x1 + w1 + p.gap;
    var x3 = x2 + w2 + p.gap;
    var fragments = [
      SmartFragment(x1, cb.y, w1, cb.h, { relationship: 'associated' }),
      SmartFragment(x2, cb.y, w2, cb.h, { relationship: 'associated' }),
      SmartFragment(x3, cb.y, w3, cb.h, { relationship: 'associated' })
    ];
    applySizeCategories(fragments);
    return assignRadii(fragments, p.gap, p.rOuter, p.rInner);
  }

  function contentSlices(p) {
    var cb = contentBounds();
    var leftW = Math.floor((cb.w - p.gap) * 0.6);
    var rightW = cb.w - leftW - p.gap;
    var rightX = cb.x + leftW + p.gap;
    var topH = Math.floor((cb.h - p.gap) * 0.55);
    var botH = cb.h - topH - p.gap;
    var fragments = [
      SmartFragment(cb.x, cb.y, leftW, cb.h, {
        relationship: 'associated',
        padding: [Tokens.spacing.lg, Tokens.spacing.sm, Tokens.spacing.lg, Tokens.spacing.lg]
      }),
      SmartFragment(rightX, cb.y, rightW, topH, { relationship: 'associated' }),
      SmartFragment(rightX, cb.y + topH + p.gap, rightW, botH, { relationship: 'associated' })
    ];
    applySizeCategories(fragments);
    return assignRadii(fragments, p.gap, p.rOuter, p.rInner);
  }

  function widgets(p) {
    var cb = contentBounds();
    var colW = Math.floor((cb.w - p.gap) / 2);
    var rowH = Math.floor((cb.h - p.gap) / 2);
    var col2X = cb.x + colW + p.gap;
    var row2Y = cb.y + rowH + p.gap;
    var col2W = cb.w - colW - p.gap;
    var row2H = cb.h - rowH - p.gap;
    var fragments = [
      SmartFragment(cb.x, cb.y, colW, rowH, { relationship: 'associated' }),
      SmartFragment(col2X, cb.y, col2W, rowH, { relationship: 'associated' }),
      SmartFragment(cb.x, row2Y, colW, row2H, { relationship: 'associated' }),
      SmartFragment(col2X, row2Y, col2W, row2H, { relationship: 'associated' })
    ];
    applySizeCategories(fragments);
    return assignRadii(fragments, p.gap, p.rOuter, p.rInner);
  }

  // ─── NOTCH PRESETS ───
  // Notch eligibility is now checked — quarter-size fragments won't get notches

  function notchSmall(p) {
    var cb = contentBounds();
    var notchSize = 64;
    var container = SmartFragment(cb.x, cb.y, cb.w, cb.h, {
      actionType: Tokens.ACTION_SECONDARY
    });
    container.sizeCategory = computeSizeCategory(container);
    var fragments = [container];

    if (isNotchEligible(container)) {
      fragments.push(SmartFragment(
        cb.x + cb.w - notchSize, cb.y + cb.h - notchSize, notchSize, notchSize, {
          notch: true, notchShape: 'circle', notchOffset: Tokens.gaps.notch
        }
      ));
    }
    return assignRadii(fragments, p.gap, p.rOuter, p.rInner);
  }

  function notchMedium(p) {
    var cb = contentBounds();
    var notchW = 200;
    var notchH = 72;
    var container = SmartFragment(cb.x, cb.y, cb.w, cb.h, {
      actionType: Tokens.ACTION_PRIMARY
    });
    container.sizeCategory = computeSizeCategory(container);
    var fragments = [container];

    if (isNotchEligible(container)) {
      fragments.push(SmartFragment(
        cb.x + cb.w - notchW, cb.y + cb.h - notchH, notchW, notchH, {
          notch: true, notchShape: 'rect', notchOffset: Tokens.gaps.notch,
          radii: [Tokens.radii.notch, Tokens.radii.notch, Tokens.radii.notch, Tokens.radii.notch]
        }
      ));
    }
    return assignRadii(fragments, p.gap, p.rOuter, p.rInner);
  }

  function notchLarge(p) {
    var cb = contentBounds();
    var notchW = 320;
    var notchH = 180;
    var container = SmartFragment(cb.x, cb.y, cb.w, cb.h, {
      actionType: Tokens.ACTION_PRIMARY
    });
    container.sizeCategory = computeSizeCategory(container);
    var fragments = [container];

    if (isNotchEligible(container)) {
      fragments.push(SmartFragment(
        cb.x + cb.w - notchW, cb.y + cb.h - notchH, notchW, notchH, {
          notch: true, notchShape: 'rect', notchOffset: Tokens.gaps.notch,
          radii: [Tokens.radii.notch, Tokens.radii.notch, Tokens.radii.notch, Tokens.radii.notch]
        }
      ));
    }
    return assignRadii(fragments, p.gap, p.rOuter, p.rInner);
  }

  function twoPanelNotch(p) {
    var cb = contentBounds();
    var leftW = Math.floor((cb.w - p.gap) * 0.4);
    var rightW = cb.w - leftW - p.gap;
    var notchSize = 64;
    var fragments = [
      SmartFragment(cb.x, cb.y, leftW, cb.h, {
        relationship: 'associated',
        actionType: Tokens.ACTION_SECONDARY
      }),
      SmartFragment(cb.x + leftW + p.gap, cb.y, rightW, cb.h, {
        relationship: 'associated'
      }),
      SmartFragment(
        cb.x + leftW + p.gap - notchSize / 2, cb.y + cb.h - notchSize, notchSize, notchSize, {
          notch: true, notchShape: 'circle', notchOffset: Tokens.gaps.notch
        }
      )
    ];
    applySizeCategories(fragments);
    return assignRadii(fragments, p.gap, p.rOuter, p.rInner);
  }

  function twoPanelBlobBL(p) {
    var cb = contentBounds();
    var leftW = Math.floor((cb.w - p.gap) * 0.55);
    var rightW = cb.w - leftW - p.gap;
    var blobW = 200;
    var blobH = 160;
    var fragments = [
      SmartFragment(cb.x, cb.y, leftW, cb.h, {
        relationship: 'associated',
        actionType: Tokens.ACTION_PRIMARY
      }),
      SmartFragment(cb.x + leftW + p.gap, cb.y, rightW, cb.h, {
        relationship: 'associated'
      }),
      SmartFragment(
        cb.x, cb.y + cb.h - blobH, blobW, blobH, {
          notch: true, notchShape: 'rect', notchOffset: Tokens.gaps.notch,
          radii: [Tokens.radii.notch, Tokens.radii.notch, Tokens.radii.notch, Tokens.radii.notch]
        }
      )
    ];
    applySizeCategories(fragments);
    return assignRadii(fragments, p.gap, p.rOuter, p.rInner);
  }

  function uiFullScreen(p) {
    var cb = contentBounds();
    var iconSize = 48;
    var stripH = 64;
    var fragments = [
      SmartFragment(cb.x, cb.y, cb.w, cb.h - stripH - p.gap, {
        relationship: 'associated',
        padding: [Tokens.spacing.lg, Tokens.spacing.lg, Tokens.spacing.md, Tokens.spacing.lg]
      }),
      SmartFragment(cb.x + cb.w - iconSize * 2 - p.gap, cb.y + Tokens.spacing.sm, iconSize, iconSize, {
        relationship: 'disassociated'
      }),
      SmartFragment(cb.x + cb.w - iconSize, cb.y + Tokens.spacing.sm, iconSize, iconSize, {
        relationship: 'disassociated'
      }),
      SmartFragment(cb.x, cb.y + cb.h - stripH, cb.w, stripH, {
        relationship: 'associated',
        padding: [Tokens.spacing.sm, Tokens.spacing.md, Tokens.spacing.sm, Tokens.spacing.md]
      })
    ];
    applySizeCategories(fragments);
    return assignRadii(fragments, p.gap, p.rOuter, p.rInner);
  }

  // ─── COLLISION DETECTION ───
  // Proximity-driven knockout computation inspired by Pete's Shapes canvas.
  // When fragments overlap (or come within collisionGap distance), the smaller
  // fragment's profile is boolean-subtracted from the larger one.

  function computeCollisions(fragments, collisionGap) {
    var collisions = [];
    if (!fragments || fragments.length < 2) return collisions;

    for (var i = 0; i < fragments.length; i++) {
      for (var j = i + 1; j < fragments.length; j++) {
        var a = fragments[i];
        var b = fragments[j];
        if (!a || !b || a.w < 1 || b.w < 1) continue;
        if (a.notch || b.notch) continue; // authored notches handled separately

        var aArea = a.w * a.h;
        var bArea = b.w * b.h;

        // Host = larger, Invader = smaller
        var host = aArea >= bArea ? a : b;
        var invader = aArea >= bArea ? b : a;
        var hostIdx = aArea >= bArea ? i : j;
        var invaderIdx = aArea >= bArea ? j : i;

        // Expand invader bounds by collisionGap to detect proximity
        var expand = collisionGap;
        var ix1 = invader.x - expand;
        var iy1 = invader.y - expand;
        var ix2 = invader.x + invader.w + expand;
        var iy2 = invader.y + invader.h + expand;

        // Host bounds
        var hx1 = host.x;
        var hy1 = host.y;
        var hx2 = host.x + host.w;
        var hy2 = host.y + host.h;

        // Check overlap between expanded invader and host
        var overlapX1 = Math.max(ix1, hx1);
        var overlapY1 = Math.max(iy1, hy1);
        var overlapX2 = Math.min(ix2, hx2);
        var overlapY2 = Math.min(iy2, hy2);

        if (overlapX1 < overlapX2 && overlapY1 < overlapY2) {
          // Determine approach edge: which side of the host is the invader nearest?
          var invCX = invader.x + invader.w / 2;
          var invCY = invader.y + invader.h / 2;
          var hostCX = host.x + host.w / 2;
          var hostCY = host.y + host.h / 2;

          var dx = invCX - hostCX;
          var dy = invCY - hostCY;
          var edge;
          if (Math.abs(dx) > Math.abs(dy)) {
            edge = dx > 0 ? 'right' : 'left';
          } else {
            edge = dy > 0 ? 'bottom' : 'top';
          }

          collisions.push({
            host: host,
            hostIndex: hostIdx,
            invader: invader,
            invaderIndex: invaderIdx,
            intersection: {
              x: overlapX1,
              y: overlapY1,
              w: overlapX2 - overlapX1,
              h: overlapY2 - overlapY1
            },
            edge: edge
          });
        }
      }
    }

    return collisions;
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

  // ─── ORGANIC KNOCKOUT LAYOUT ───
  // Single container + circle, returns a scene descriptor for renderOrganic()

  function organicKnockout(p) {
    var cb = contentBounds(0);
    var circleR = (p.notchSize || 200) / 2;
    // Position circle fully inside container, touching top-right corner.
    // Centre is one radius inward from each edge, then snap bounds to grid.
    var cx = cb.x + cb.w - circleR;
    var cy = cb.y + circleR;
    // Snap circle bounds to nearest grid lines
    var snappedRight = VectorGrid.snapToGrid(cx + circleR);
    var snappedTop = VectorGrid.snapToGrid(cy - circleR);
    cx = snappedRight - circleR;
    cy = snappedTop + circleR;
    return {
      container: { x: cb.x, y: cb.y, w: cb.w, h: cb.h },
      circle: { cx: cx, cy: cy, r: circleR },
      notchOffset: p.notchOffset !== undefined ? p.notchOffset : Tokens.gaps.notch,
      rOrganic: p.rOrganic !== undefined ? p.rOrganic : Tokens.radii.organic,
      rBase: p.rOuter !== undefined ? p.rOuter : Tokens.radii.outer
    };
  }

  return {
    PRESETS: PRESETS,
    generate: generate,
    assignRadii: assignRadii,
    isNotchEligible: isNotchEligible,
    selectNotchSize: selectNotchSize,
    computeCollisions: computeCollisions,
    organicKnockout: organicKnockout
  };
})();
