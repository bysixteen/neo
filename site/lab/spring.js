// Spring animation — Apple's duration + bounce model
// duration: roughly how long the animation takes (seconds)
// bounce: 0 = critically damped (no overshoot), 1 = maximum oscillation

function Spring(duration, bounce) {
  this.duration = duration || 0.5;
  this.bounce = bounce || 0;
  this.running = false;
  this.startTime = 0;
  this.from = 0;
  this.to = 0;
  this.current = 0;
}

Spring.prototype.start = function (from, to, time) {
  this.from = from;
  this.to = to;
  this.current = from;
  this.startTime = time;
  this.running = true;
};

Spring.prototype.update = function (time) {
  if (!this.running) return this.current;

  var elapsed = (time - this.startTime) / 1000;
  var t = elapsed / this.duration;

  if (t >= 3) {
    this.current = this.to;
    this.running = false;
    return this.current;
  }

  var value = springCurve(t, this.bounce);
  this.current = this.from + (this.to - this.from) * value;
  return this.current;
};

// Spring curve evaluation
// t: normalised time (0 = start, 1 ≈ settled)
// bounce: 0-1
function springCurve(t, bounce) {
  if (t <= 0) return 0;

  // Damping ratio from bounce
  var damping = 1 - bounce * 0.8; // 1 = critically damped, 0.2 = very bouncy
  var omega = Math.PI * 2; // natural frequency

  if (damping >= 1) {
    // Critically/over-damped — no oscillation
    var decay = Math.exp(-omega * damping * t);
    return 1 - decay * (1 + omega * damping * t);
  }

  // Under-damped — oscillation
  var dampedOmega = omega * Math.sqrt(1 - damping * damping);
  var decay = Math.exp(-omega * damping * t);
  var osc = Math.cos(dampedOmega * t) + (damping * omega / dampedOmega) * Math.sin(dampedOmega * t);
  return 1 - decay * osc;
}

// Material presets — each is a motion behaviour, not a visual style
var MATERIAL_PRESETS = {
  elastomer: { label: 'Elastomer', duration: 0.45, bounce: 0.35 },
  silicon:   { label: 'Silicon',   duration: 0.3,  bounce: 0.08 },
  oil:       { label: 'Thick Oil', duration: 0.9,  bounce: 0.0 },
  putty:     { label: 'Silly Putty', duration: 0.7, bounce: 0.15 },
  snappy:    { label: 'Snappy',    duration: 0.25, bounce: 0.2 }
};
