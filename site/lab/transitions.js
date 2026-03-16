// Transition manager — interpolates between layout states using springs
// Each shape property gets its own Spring instance, all sharing duration/bounce

var Transition = (function () {
  var springs = [];    // array of arrays — one per shape, each containing springs for x,y,w,h,radii,scale,opacity
  var fromShapes = [];
  var toShapes = [];
  var active = false;
  var currentShapes = [];
  var duration = 0.45;
  var bounce = 0.35;

  // Property keys we animate
  var PROPS = ['x', 'y', 'w', 'h', 'scale', 'opacity'];
  var RADII_COUNT = 4;

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

    // Match shape counts — pad with zero-size shapes for enter/exit
    var maxLen = Math.max(from.length, to.length);

    for (var i = 0; i < maxLen; i++) {
      var f = from[i] || makeGhost(to[i]);
      var t = to[i] || makeGhost(from[i]);

      var shapeSprings = {};

      // Animate each property
      for (var p = 0; p < PROPS.length; p++) {
        var key = PROPS[p];
        var sp = new Spring(duration, bounce);
        sp.start(f[key], t[key], time);
        shapeSprings[key] = sp;
      }

      // Animate each corner radius
      shapeSprings.radii = [];
      for (var r = 0; r < RADII_COUNT; r++) {
        var rsp = new Spring(duration, bounce);
        rsp.start(f.radii[r], t.radii[r], time);
        shapeSprings.radii.push(rsp);
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

      for (var p = 0; p < PROPS.length; p++) {
        var key = PROPS[p];
        shape[key] = ss[key].update(time);
        if (ss[key].running) allSettled = false;
      }

      for (var r = 0; r < RADII_COUNT; r++) {
        shape.radii[r] = ss.radii[r].update(time);
        if (ss.radii[r].running) allSettled = false;
      }
    }

    if (allSettled) {
      active = false;
      // Snap to final values
      for (var i = 0; i < currentShapes.length; i++) {
        var t = toShapes[i] || makeGhost(fromShapes[i]);
        for (var p = 0; p < PROPS.length; p++) {
          currentShapes[i][PROPS[p]] = t[PROPS[p]];
        }
        for (var r = 0; r < RADII_COUNT; r++) {
          currentShapes[i].radii[r] = t.radii[r];
        }
      }
    }

    return currentShapes;
  }

  function isActive() { return active; }
  function getShapes() { return currentShapes; }

  // Ghost shape — same position but zero size, used for enter/exit animations
  function makeGhost(reference) {
    return {
      x: reference.x + reference.w / 2,
      y: reference.y + reference.h / 2,
      w: 0, h: 0,
      radii: [0, 0, 0, 0],
      scale: 0,
      opacity: 0
    };
  }

  function cloneShape(s) {
    return {
      x: s.x, y: s.y, w: s.w, h: s.h,
      radii: s.radii.slice(),
      scale: s.scale,
      opacity: s.opacity
    };
  }

  return {
    setSpringParams: setSpringParams,
    start: start,
    update: update,
    isActive: isActive,
    getShapes: getShapes
  };
})();
