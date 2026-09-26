import React, { useEffect, useRef } from 'react';

/* ─── Animated DSA background canvas ─────────────────────────
   Three layered effects:
   1. Drifting graph nodes connected by glowing edges (Graph / BFS visual)
   2. Rain columns of DSA keywords / code chars (Matrix-style)
   3. Soft moving gradient orbs (ambient light)
─────────────────────────────────────────────────────────────── */
export default function AnimatedBackground() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    /* ── Resize helper ── */
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* ── DSA / code tokens for the rain ── */
    const DSA_CHARS = [
      'O(n)', 'O(1)', 'O(log n)', 'BFS', 'DFS', 'dp[]', 'sort()',
      'hash', 'null', 'left', 'right', 'root', 'head', 'next',
      'push()', 'pop()', 'queue', 'stack', 'heap', 'graph',
      'node', 'edge', 'key', 'val', '→', '←', '↑', '↓',
      '0', '1', '{}', '[]', '()', '=>', '&&', '||',
      'if', 'for', 'while', 'return', 'null', 'true',
      'pivot', 'mid', 'low', 'high', 'memo', 'vis[]'
    ];

    /* ── Colour palette (Gemini / blue-purple) ── */
    const PALETTE = [
      'rgba(66,133,244,',   // google blue
      'rgba(139,92,246,',   // purple
      'rgba(6,182,212,',    // cyan
      'rgba(52,168,83,',    // green
      'rgba(251,188,5,',    // amber (rare)
    ];

    /* ───────────────────────────────────────────────────
       LAYER 1 — Floating graph nodes
    ─────────────────────────────────────────────────────*/
    const NODE_COUNT = 28;

    const nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 4 + 3,               // radius 3-7
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      label: DSA_CHARS[Math.floor(Math.random() * DSA_CHARS.length)],
      pulseT: Math.random() * Math.PI * 2,     // phase offset for glow pulse
    }));

    /* edge: connect nodes within 200px */
    const MAX_EDGE_DIST = 195;

    /* ───────────────────────────────────────────────────
       LAYER 2 — Code rain columns
    ─────────────────────────────────────────────────────*/
    const COL_WIDTH = 22; // px between columns
    const colCount  = Math.ceil(canvas.width / COL_WIDTH);

    const rain = Array.from({ length: colCount }, () => ({
      y:       Math.random() * -canvas.height,    // start above screen
      speed:   Math.random() * 1.2 + 0.4,
      opacity: Math.random() * 0.4 + 0.06,
      colorIdx: Math.floor(Math.random() * PALETTE.length),
      token:   DSA_CHARS[Math.floor(Math.random() * DSA_CHARS.length)],
      // how many chars tall this stream is
      length:  Math.floor(Math.random() * 18 + 8),
    }));

    /* ───────────────────────────────────────────────────
       LAYER 3 — Moving ambient orbs
    ─────────────────────────────────────────────────────*/
    const ORBS = [
      { x: 0.2, y: 0.15, r: 320, color: 'rgba(66,133,244,0.07)', vx: 0.0003, vy: 0.0002 },
      { x: 0.75, y: 0.6, r: 400, color: 'rgba(139,92,246,0.06)', vx:-0.0002, vy: 0.0003 },
      { x: 0.5, y: 0.9, r: 280, color: 'rgba(6,182,212,0.05)',   vx: 0.0002, vy:-0.0002 },
      { x: 0.9, y: 0.1, r: 260, color: 'rgba(52,168,83,0.04)',   vx:-0.0003, vy: 0.0002 },
    ];

    let t = 0; // global animation tick

    /* ── Main draw loop ── */
    const draw = () => {
      t += 0.012;
      const W = canvas.width;
      const H = canvas.height;

      /* clear */
      ctx.clearRect(0, 0, W, H);

      /* ── Draw orbs ── */
      ORBS.forEach(orb => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < 0 || orb.x > 1) orb.vx *= -1;
        if (orb.y < 0 || orb.y > 1) orb.vy *= -1;

        const cx = orb.x * W;
        const cy = orb.y * H;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.r);
        grad.addColorStop(0,   orb.color);
        grad.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      /* ── Draw code rain ── */
      rain.forEach((col, i) => {
        col.y += col.speed;
        if (col.y > H + 30) {
          col.y      = Math.random() * -200;
          col.speed  = Math.random() * 1.2 + 0.4;
          col.opacity= Math.random() * 0.4 + 0.06;
          col.token  = DSA_CHARS[Math.floor(Math.random() * DSA_CHARS.length)];
          col.length = Math.floor(Math.random() * 18 + 8);
          col.colorIdx = Math.floor(Math.random() * PALETTE.length);
        }

        const base  = PALETTE[col.colorIdx];
        const x     = i * COL_WIDTH + COL_WIDTH / 2;

        for (let k = 0; k < col.length; k++) {
          const charY  = col.y - k * 16;
          const fade   = ((col.length - k) / col.length) * col.opacity;
          if (charY < -20 || charY > H + 20) continue;

          // head char is brightest
          const alpha = k === 0 ? fade * 2.5 : fade;
          ctx.fillStyle = `${base}${Math.min(alpha, 0.95)})`;
          ctx.font = `${k === 0 ? 11 : 10}px 'JetBrains Mono', monospace`;
          ctx.textAlign = 'center';

          // Rotate head char slightly for flair
          if (k === 0) {
            ctx.save();
            ctx.translate(x, charY);
            ctx.rotate(Math.sin(t * 2 + i) * 0.08);
            ctx.fillText(col.token, 0, 0);
            ctx.restore();
          } else {
            const token = DSA_CHARS[Math.floor((t * 3 + i + k) % DSA_CHARS.length)];
            ctx.fillText(token, x, charY);
          }
        }
      });

      /* ── Update node positions ── */
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulseT += 0.035;
        // wrap around edges
        if (n.x < -20)  n.x = W + 20;
        if (n.x > W+20) n.x = -20;
        if (n.y < -20)  n.y = H + 20;
        if (n.y > H+20) n.y = -20;
      });

      /* ── Draw edges between close nodes ── */
      for (let a = 0; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          const na = nodes[a], nb = nodes[b];
          const dx = na.x - nb.x, dy = na.y - nb.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > MAX_EDGE_DIST) continue;

          const alpha = (1 - dist / MAX_EDGE_DIST) * 0.22;
          // Gradient edge
          const grad = ctx.createLinearGradient(na.x, na.y, nb.x, nb.y);
          grad.addColorStop(0, `${na.color}${alpha})`);
          grad.addColorStop(1, `${nb.color}${alpha})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth   = 0.8;
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.stroke();

          // Travelling "packet" dot along the edge (BFS packet visual)
          const speed = 0.5;
          const prog  = ((t * speed + a * 0.7 + b * 0.4) % 1 + 1) % 1;
          const px    = na.x + (nb.x - na.x) * prog;
          const py    = na.y + (nb.y - na.y) * prog;
          ctx.fillStyle = `${na.color}0.6)`;
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* ── Draw nodes ── */
      nodes.forEach(n => {
        const glow = (Math.sin(n.pulseT) + 1) / 2; // 0-1
        const outerR = n.r + 4 + glow * 5;

        // Glow halo
        const haloGrad = ctx.createRadialGradient(n.x, n.y, n.r * 0.5, n.x, n.y, outerR);
        haloGrad.addColorStop(0, `${n.color}${0.35 + glow * 0.2})`);
        haloGrad.addColorStop(1, `${n.color}0)`);
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, outerR, 0, Math.PI * 2);
        ctx.fill();

        // Core node
        ctx.fillStyle = `${n.color}0.85)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        // Label below node
        ctx.fillStyle = `${n.color}${0.5 + glow * 0.3})`;
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + n.r + 10);
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:  'fixed',
        inset:     0,
        width:     '100vw',
        height:    '100vh',
        zIndex:    0,
        pointerEvents: 'none',
        opacity:   0.85
      }}
    />
  );
}
