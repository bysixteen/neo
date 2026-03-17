// Transition manager — interpolates between SmartFragment states using springs
// Animates position, size, radii, padding, scale, and opacity.
// Non-numeric metadata (relationship, actionType, etc.) is snapped at settle.

var Transition = (function () {
  var springs = [];
  var fromShapes = [];
  var toShapes = [];
  var active = false;
  var currentShapes = [];
  var duration = 0.45;
  var bounce = 0.35;

  var PROPS = ['x', 'y', 'w', 'h', 'scale', 'opacity'];
  var ARRAY_PROPS = ['radii', 'padding']; // both have 4 values
  var ARRAY_LEN = 4;

  function setSpringParams(d, b) {
    duration = d;
    bounce = b;
  }

  function start(from, to, time) {
    fromShapes = from;
    toShapes = to;
    springs = [];
    currentShapes = [];
    active = true;

    var maxLen = Math.max(from.length, to.length);

    for (var i = 0; i < maxLen; i++) {
      var f = from[i] || makeGhost(to[i]);
      var t = to[i] || makeGhost(from[i]);

      var shapeSprings = {};

      // Scalar properties
      for (var p = 0; p < PROPS.length; p++) {
        var key = PROPS[p];
        var sp = new Spring(duration, bounce);
        sp.start(f[key], t[key], time);
        shapeSprings[key] = sp;
      }

      // Array properties (radii + padding)
      for (var a = 0; a < ARRAY_PROPS.length; a++) {
        var arrKey = ARRAY_PROPS[a];
        shapeSprings[arrKey] = [];
        for (var r = 0; r < ARRAY_LEN; r++) {
          var asp = new Spring(duration, bounce);
          asp.start(f[arrKey][r], t[arrKey][r], time);
          shapeSprings[arrKey].push(asp);
        }
      }

      springs.push(shapeSprings);
      currentShapes.push(cloneShape(f));
    }
  }

  function update(time) {
    if (!active) return currentShapes;

    var allSettled = true;

    for (var i = 0; i < springs.length; i++) {
      var ss = springs[i];
      var shape = currentShapes[i];

      // Scalar properties
      for (var p = 0; p < PROPS.length; p++) {
        var key = PROPS[p];
        shape[key] = ss[key].update(time);
        if (ss[key].running) allSettled = false;
      }

      // Array properties
      for (var a = 0; a < ARRAY_PROPS.length; a++) {
        var arrKey = ARRAY_PROPS[a];
        for (var r = 0; r < ARRAY_LEN; r++) {
          shape[arrKey][r] = ss[arrKey][r].update(time);
          if (ss[arrKey][r].running) allSettled = false;
        }
      }
    }

    if (allSettled) {
      active = false;
      for (var i = 0; i < currentShapes.length; i++) {
        var t = toShapes[i] || makeGhost(fromShapes[i]);

        // Snap numeric values
        for (var p = 0; p < PROPS.length; p++) {
          currentShapes[i][PROPS[p]] = t[PROPS[p]];
        }
        for (var a = 0; a < ARRAY_PROPS.length; a++) {
          var arrKey = ARRAY_PROPS[a];
          for (var r = 0; r < ARRAY_LEN; r++) {
            currentShapes[i][arrKey][r] = t[arrKey][r];
          }
        }

        // Snap metadata
        copyMetadata(currentShapes[i], t);
      }
    }

    return currentShapes;
  }

  function isActive() { return active; }
  function getShapes() { return currentShapes; }

  // Ghost — same centre but zero size, used for enter/exit
  function makeGhost(reference) {
    return {
      x: reference.x + reference.w / 2,
      y: reference.y + reference.h / 2,
      w: 0, h: 0,
      radii: [0, 0, 0, 0],
      padding: reference.padding ? reference.padding.slice() : [0, 0, 0, 0],
      scale: 0,
      opacity: 0,
      relationship: reference.relationship || 'disassociated',
      actionType: reference.actionType || Tokens.ACTION_NONE,
      sizeCategory: reference.sizeCategory || null,
      notch: reference.notch || false,
      notchShape: reference.notchShape || null,
      notchOffset: reference.notchOffset || Tokens.gaps.notch,
      chrome: false,
      chromeType: null
    };
  }

  function cloneShape(s) {
    var c = {
      x: s.x, y: s.y, w: s.w, h: s.h,
      radii: s.radii.slice(),
      padding: s.padding ? s.padding.slice() : [0, 0, 0, 0],
      scale: s.scale,
      opacity: s.opacity
    };
    copyMetadata(c, s);
    return c;
  }

  // Copy all non-numeric SmartFragment metadata
  function copyMetadata(target, source) {
    target.relationship = source.relationship || 'disassociated';
    target.actionType = source.actionType || Tokens.ACTION_NONE;
    target.sizeCategory = source.sizeCategory || null;
    target.chrome = source.chrome || false;
    target.chromeType = source.chromeType || null;

    if (source.notch) {
      target.notch = source.notch;
      target.notchShape = source.notchShape;
      target.notchOffset = source.notchOffset;
    } else {
      delete target.notch;
      delete target.notchShape;
      delete target.notchOffset;
    }
  }

  return {
    setSpringParams: setSpringParams,
    start: start,
    update: update,
    isActive: isActive,
    getShapes: getShapes
  };
})();
