import { drawChart } from './chart.js';

const STORAGE_KEYS = {
  letters: 'abc_learn_letters',
  numbers: 'abc_learn_numbers',
  words: 'abc_learn_words',
};
const MAX_SESSIONS = 10;
const TOTAL = 10;

const MODULE_LABELS = {
  letters: { icon: '🔤', name: 'Букви' },
  numbers: { icon: '🔢', name: 'Цифри' },
  words: { icon: '💬', name: 'Слова' },
};

export const loadHistory = (module = 'letters') => {
  try {
    return (
      JSON.parse(localStorage.getItem(STORAGE_KEYS[module]) ?? 'null') ?? []
    );
  } catch {
    return [];
  }
};

/**
 * @param {number} correct
 * @param {number} wrong
 * @param {'letters'|'numbers'|'words'} module
 */
export const saveSession = (correct, wrong, module = 'letters') => {
  const history = loadHistory(module);
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');

  history.push({
    date: `${pad(now.getDate())}.${pad(now.getMonth() + 1)}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    correct,
    wrong,
  });

  try {
    localStorage.setItem(
      STORAGE_KEYS[module],
      JSON.stringify(history.slice(-MAX_SESSIONS))
    );
  } catch {
    /* storage quota exceeded */
  }
};

const buildModuleHistory = (container, module) => {
  const history = loadHistory(module);
  const label = MODULE_LABELS[module];

  const section = document.createElement('div');
  section.className = 'hist-module-section';

  section.innerHTML = `
    <div class="hist-module-header">
      <span class="hist-module-icon">${label.icon}</span>
      <span class="hist-module-name">${label.name}</span>
    </div>`;

  if (!history.length) {
    section.insertAdjacentHTML(
      'beforeend',
      `
      <div class="hist-empty-mini">Ще немає результатів</div>`
    );
    container.appendChild(section);
    return;
  }

  const totalCorrect = history.reduce((s, h) => s + h.correct, 0);
  const avg = Math.round((totalCorrect / history.length) * 10) / 10;
  const best = Math.max(...history.map((h) => h.correct));
  const accuracy = Math.round((totalCorrect / (history.length * TOTAL)) * 100);

  section.insertAdjacentHTML(
    'beforeend',
    `
    <div class="hist-summary-row">
      <div class="hist-summary-box">
        <div class="hist-summary-val">${history.length}</div>
        <div class="hist-summary-lbl">Сесій</div>
      </div>
      <div class="hist-summary-box">
        <div class="hist-summary-val" style="color:var(--success)">${avg}</div>
        <div class="hist-summary-lbl">Середнє</div>
      </div>
      <div class="hist-summary-box">
        <div class="hist-summary-val" style="color:var(--accent)">${best}</div>
        <div class="hist-summary-lbl">Рекорд</div>
      </div>
      <div class="hist-summary-box">
        <div class="hist-summary-val" style="color:var(--warn)">${accuracy}%</div>
        <div class="hist-summary-lbl">Точність</div>
      </div>
    </div>`
  );

  const chartSection = document.createElement('div');
  chartSection.className = 'hist-chart-section';
  chartSection.innerHTML =
    '<div class="hist-section-title">Графік прогресу</div>';

  const canvas = document.createElement('canvas');
  canvas.width = 580;
  canvas.height = 220;
  canvas.style.cssText = 'width:100%;height:auto;display:block;';
  chartSection.appendChild(canvas);

  chartSection.insertAdjacentHTML(
    'beforeend',
    `
    <div class="chart-legend">
      <div class="legend-item"><div class="legend-dot c"></div>Правильно</div>
      <div class="legend-item"><div class="legend-dot w"></div>Неправильно</div>
      <div class="legend-item" style="color:var(--accent)">⸺ Тренд</div>
    </div>`
  );

  section.appendChild(chartSection);
  requestAnimationFrame(() => drawChart(canvas, history));

  const grid = document.createElement('div');
  grid.className = 'hist-sessions-grid';

  [...history].reverse().forEach((s, reversedIdx) => {
    const num = history.length - reversedIdx;
    const medal = s.correct >= 8 ? '🌟' : s.correct >= 5 ? '😊' : '💪';

    const row = document.createElement('div');
    row.className = 'session-row';
    row.style.animationDelay = `${reversedIdx * 0.05}s`;
    row.innerHTML = `
      <div class="session-index">#${num}</div>
      <div class="session-date">
        <div class="session-date-main">${s.date}</div>
        <div class="session-date-time">${s.time}</div>
      </div>
      <div class="session-bars">
        <div class="session-bar-wrap">
          <div class="session-bar-fill c" style="width:${(s.correct / TOTAL) * 100}%"></div>
        </div>
      </div>
      <div class="session-score">
        <div class="session-score-item c">✓${s.correct}</div>
        <div class="session-score-item w">✗${s.wrong}</div>
      </div>
      <div class="session-medal">${medal}</div>`;
    grid.appendChild(row);
  });

  section.appendChild(grid);
  container.appendChild(section);
};

export const buildFullHistory = (container) => {
  container.innerHTML = '';

  const modules = ['letters', 'numbers', 'words'];
  const hasAny = modules.some((m) => loadHistory(m).length > 0);

  if (!hasAny) {
    container.innerHTML = `
      <div class="hist-empty">
        <span class="hist-empty-icon">📭</span>
        <div class="hist-empty-title">Поки що порожньо</div>
        <div class="hist-empty-sub">Зіграй першу гру —<br>і тут з'явиться твій прогрес!</div>
      </div>`;
    return;
  }

  modules.forEach((m) => buildModuleHistory(container, m));
};

export const buildModuleHistoryPage = (container, module) => {
  container.innerHTML = '';
  buildModuleHistory(container, module);
};
