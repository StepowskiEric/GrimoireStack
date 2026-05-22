import { useEffect, useRef } from 'react';

export default function Embers() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const types = ['ember-amber', 'ember-gold', 'ember-rune'];
    for (let i = 0; i < 40; i++) {
      const e = document.createElement('div');
      e.className = 'ember ' + types[i % 3];
      e.style.left = Math.random() * 100 + '%';
      e.style.width = e.style.height = (2 + Math.random() * 3) + 'px';
      e.style.animationDuration = (15 + Math.random() * 25) + 's';
      e.style.animationDelay = (Math.random() * 20) + 's';
      el.appendChild(e);
    }
    for (let i = 0; i < 15; i++) {
      const e = document.createElement('div');
      e.className = 'ember ' + (i % 2 === 0 ? 'ember-amber' : 'ember-gold');
      e.style.left = Math.random() * 100 + '%';
      e.style.width = e.style.height = (5 + Math.random() * 8) + 'px';
      e.style.animationDuration = (35 + Math.random() * 30) + 's';
      e.style.animationDelay = (Math.random() * 30) + 's';
      el.appendChild(e);
    }
  }, []);
  return <div id="embers" ref={ref} />;
}
