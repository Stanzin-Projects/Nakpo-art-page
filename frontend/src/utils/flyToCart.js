/**
 * Fly-to-cart: an artwork thumbnail arcs from where the user clicked into the
 * navigation cart, shrinking and fading as it lands, then the cart pops and a
 * ring pings out of it.
 *
 * The path is a quadratic curve drawn between the two points with a rotating
 * tangent, so the tile travels along an arc instead of a straight line. The
 * curve is sampled into keyframes and handed to the Web Animations API, which
 * runs it on the compositor — no animation library, and it keeps moving even
 * if the main thread is busy.
 *
 * The cart needs `data-cart-target` on it, and an optional `data-cart-ping`
 * child to receive the ring.
 */

const TARGET = 42;
const TILE_MAX = 132;
const STEPS = 28;
const DURATION = 640;

function wrap(min, max, value) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

function quadratic(t, p0, p1, p2) {
  const rest = 1 - t;
  return rest * rest * p0 + 2 * rest * t * p1 + t * t * p2;
}

function tangentAngle(t, x0, cx, x1, y0, cy, y1) {
  const dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx);
  const dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

function controlPoint(x0, y0, x1, y1, strength, peak) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length > 0) {
    return {
      x: x0 + dx * peak + (-dy / length) * strength * length,
      y: y0 + dy * peak + (dx / length) * strength * length,
    };
  }
  return { x: x0, y: y0 };
}

function createArcMixer({ strength = 0.4, peak = 0.22, rotate = 0.8 } = {}) {
  return (from, to) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    // always bow the same way, so repeated adds trace a consistent arc
    const curve = (Math.abs(dx) >= Math.abs(dy) ? dx : dy) < 0 ? -strength : strength;
    const ctrl = controlPoint(from.x, from.y, to.x, to.y, curve, peak);

    const startAngle = tangentAngle(0, from.x, ctrl.x, to.x, from.y, ctrl.y, to.y);
    const endAngle = tangentAngle(1, from.x, ctrl.x, to.x, from.y, ctrl.y, to.y);
    const angleDelta = wrap(-180, 180, endAngle - startAngle);

    return (t) => {
      const angle = tangentAngle(t, from.x, ctrl.x, to.x, from.y, ctrl.y, to.y);
      return {
        x: quadratic(t, from.x, ctrl.x, to.x),
        y: quadratic(t, from.y, ctrl.y, to.y),
        rotate: wrap(-180, 180, angle - (startAngle + angleDelta * t)) * rotate,
      };
    };
  };
}

/** Ease into the basket: slow lift-off, accelerating arrival. */
const easeIn = (t) => t * t * (3 - 2 * t) * 0.35 + t * t * 0.65;

function pulse(cart) {
  if (!cart || typeof cart.animate !== 'function') return;
  cart.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.16)' }, { transform: 'scale(1)' }],
    { duration: 420, easing: 'ease-out' }
  );
  const ping = cart.querySelector('[data-cart-ping]');
  if (ping) {
    ping.animate(
      [
        { transform: 'scale(.5)', opacity: 0.65 },
        { transform: 'scale(1.9)', opacity: 0 },
      ],
      { duration: 560, easing: 'ease-out' }
    );
  }
}

let running = false;

export function flyToCart({ from, image } = {}) {
  if (typeof document === 'undefined') return;
  const cart = document.querySelector('[data-cart-target]');
  if (!cart) return;

  const reduced =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // No source, no artwork or reduced motion: still acknowledge the add.
  if (!from || !image || reduced || running || typeof from.getBoundingClientRect !== 'function') {
    pulse(cart);
    return;
  }

  const box = from.getBoundingClientRect();
  const to = cart.getBoundingClientRect();
  if (!box.width || !box.height || !to.width) {
    pulse(cart);
    return;
  }

  running = true;

  const w = Math.min(TILE_MAX, box.width);
  const h = Math.max(1, w * (box.height / box.width));

  const node = document.createElement('div');
  node.setAttribute('aria-hidden', 'true');
  node.style.cssText =
    'position:fixed;pointer-events:none;z-index:9999;overflow:hidden;will-change:transform,opacity;' +
    'box-shadow:0 14px 32px -10px rgba(0,0,0,.45);background:#fff;' +
    `left:${box.left}px;top:${box.top}px;width:${w}px;height:${h}px;border-radius:10px;`;

  const img = document.createElement('img');
  img.src = image;
  img.alt = '';
  img.draggable = false;
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
  node.appendChild(img);
  document.body.appendChild(node);

  // Measure from the tile's own centre (it is capped to TILE_MAX and pinned to
  // the source's top-left), not the source element's centre.
  const dx = to.left + to.width / 2 - (box.left + w / 2);
  const dy = to.top + to.height / 2 - (box.top + h / 2);
  const path = createArcMixer()({ x: 0, y: 0 }, { x: dx, y: dy });
  const endScale = Math.max(0.16, TARGET / Math.max(w, h));

  const frames = [];
  for (let i = 0; i <= STEPS; i++) {
    const offset = i / STEPS;
    const p = easeIn(offset);
    const point = path(p);
    frames.push({
      offset,
      transform:
        `translate3d(${point.x}px, ${point.y}px, 0) rotate(${point.rotate}deg) ` +
        `scale(${1 + (endScale - 1) * p})`,
      opacity: p < 0.86 ? 1 : Math.max(0, 1 - (p - 0.86) / 0.14),
    });
  }

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    node.remove();
    running = false;
    pulse(cart);
  };

  const anim = node.animate(frames, { duration: DURATION, easing: 'linear', fill: 'forwards' });
  anim.onfinish = finish;
  anim.oncancel = finish;
  // Safety net: finish events are deferred while a tab is in the background,
  // so make sure the tile is cleaned up either way.
  setTimeout(finish, DURATION + 220);
}
