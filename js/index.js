const alpha = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const container = document.getElementById('heroLetters');
for (let i = 0; i < 14; i++) {
  const el = document.createElement('div');
  el.className = 'hero-letter';
  el.textContent = alpha[Math.floor(Math.random() * alpha.length)];
  const size = 36 + Math.random() * 64;
  const dur = 9 + Math.random() * 12;
  const rot = (Math.random() - 0.5) * 36;
  el.style.cssText = `font-size:${size}px;left:${Math.random() * 88}%;top:${10 + Math.random() * 110}%;--r:${rot}deg;animation-duration:${dur}s;animation-delay:${-Math.random() * dur}s;`;
  container.appendChild(el);
}

const KEYS = {
  letters: 'abc_learn_letters',
  numbers: 'abc_learn_numbers',
  words: 'abc_learn_words',
};

const renderStats = (module, elId) => {
  try {
    const h = JSON.parse(localStorage.getItem(KEYS[module]) ?? 'null') ?? [];
    if (!h.length) return;
    const best = Math.max(...h.map((s) => s.correct));
    document.getElementById(elId).innerHTML = `
      <div class="module-stat">
        <div class="module-stat-val">${h.length}</div>
        <div class="module-stat-lbl">Сесій</div>
      </div>
      <div class="module-stat">
        <div class="module-stat-val" style="color:var(--accent)">${best}</div>
        <div class="module-stat-lbl">Рекорд</div>
      </div>`;
  } catch {
    /* ignore */
  }
};

renderStats('letters', 'statsLetters');
renderStats('numbers', 'statsNumbers');
renderStats('words', 'statsWords');
