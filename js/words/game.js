import { speak } from '../shared/speech.js';
import { saveSession } from '../shared/history-store.js';

const TOTAL = 10;

const ALL_WORDS = await fetch(
  new URL('../../data/words.json', import.meta.url)
).then((r) => r.json());

let session = [];
let idx = 0;
let correct = 0;
let wrong = 0;
let locked = false;
let mode = 'en-ua';

const wordDisplay = document.getElementById('wordDisplay');

const progressLabel = document.getElementById('progressLabel');
const progressFill = document.querySelector('.progress-fill');
const statusEl = document.getElementById('statusText');
const listenBtn = document.getElementById('btnListen');
const modeToggle = document.getElementById('modeToggle');

export const isLocked = () => locked;

export const setStatus = (text, type = 'info') => {
  statusEl.textContent = text;
  statusEl.className = `status ${type}`;
};

export const setLocked = (state) => {
  locked = state;
  listenBtn.disabled = state;
  const sp = document.getElementById('btnSpeak');
  if (sp) sp.disabled = state;
};

const normalize = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[.?!,]/g, '');

const generateSession = () =>
  [...ALL_WORDS].sort(() => Math.random() - 0.5).slice(0, TOTAL);

const showWord = () => {
  const item = session[idx];

  wordDisplay.style.animation = 'none';
  void wordDisplay.offsetWidth;
  wordDisplay.style.animation = '';

  wordDisplay.textContent = mode === 'en-ua' ? item.en : item.ua;

  progressLabel.textContent = `Слово ${idx + 1} з ${TOTAL}`;
  progressFill.style.width = `${(idx / TOTAL) * 100}%`;

  setStatus('Натисни Listen або Speak');
  setLocked(false);
};

const nextWord = () => {
  idx++;
  idx >= TOTAL ? showResult() : showWord();
};

export const checkAnswer = (raw) => {
  const input = normalize(raw);
  const expected = normalize(
    mode === 'en-ua' ? session[idx].ua : session[idx].en
  );

  if (input === expected) {
    correct++;
    setStatus('Молодець! ✅', 'success');
    setLocked(true);
    setTimeout(nextWord, 2000);
  } else {
    wrong++;
    const answer = mode === 'en-ua' ? session[idx].ua : session[idx].en;
    setStatus(`Правильно: "${answer}" ❌`, 'error');
    setLocked(true);

    speak(session[idx].en, () => nextWord());
  }
};

export const handleListen = () => {
  if (locked) return;
  setLocked(true);

  speak(session[idx].en, () => setLocked(false));
};

if (modeToggle) {
  modeToggle.addEventListener('click', () => {
    mode = mode === 'en-ua' ? 'ua-en' : 'en-ua';
    modeToggle.textContent = mode === 'en-ua' ? '🔄 EN → UA' : '🔄 UA → EN';
    startGame();
  });
}

const showResult = () => {
  saveSession(correct, wrong, 'words');
  progressFill.style.width = '100%';

  document.getElementById('resCorrect').textContent = correct;
  document.getElementById('resWrong').textContent = wrong;

  if (correct >= 8) {
    document.getElementById('resultEmoji').textContent = '🌟';
    document.getElementById('resultGrade').textContent = 'Відмінно!';
    document.getElementById('resultSub').textContent =
      `Правильно ${correct} з ${TOTAL} — ти молодець!`;
  } else if (correct >= 5) {
    document.getElementById('resultEmoji').textContent = '😊';
    document.getElementById('resultGrade').textContent = 'Непогано!';
    document.getElementById('resultSub').textContent =
      `Правильно ${correct} з ${TOTAL} — продовжуй тренуватись!`;
  } else {
    document.getElementById('resultEmoji').textContent = '💪';
    document.getElementById('resultGrade').textContent = 'Не здавайся!';
    document.getElementById('resultSub').textContent =
      `Правильно ${correct} з ${TOTAL} — ще трохи практики!`;
  }

  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('resultScreen').classList.add('active');
};

export const startGame = () => {
  session = generateSession();
  idx = correct = wrong = 0;
  progressFill.style.width = '0%';

  if (modeToggle) {
    modeToggle.textContent = mode === 'en-ua' ? '🔄 EN → UA' : '🔄 UA → EN';
  }

  document.getElementById('resultScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');

  showWord();
};
