import { speak } from '../shared/speech.js';
import { saveSession } from '../shared/history-store.js';

const TOTAL = 10;

const ALL_NUMBERS = await fetch(
  new URL('../../data/numbers.json', import.meta.url)
).then((r) => r.json());

let session = [];
let idx = 0;
let correct = 0;
let wrong = 0;
let locked = false;

const numberDisplay = document.getElementById('numberDisplay');
const progressLabel = document.getElementById('progressLabel');
const progressFill = document.querySelector('.progress-fill');
const statusEl = document.getElementById('statusText');
const listenBtn = document.getElementById('btnListen');

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

const generateSession = () => {
  const shuffled = [...ALL_NUMBERS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, TOTAL);
};

const showNumber = () => {
  const item = session[idx];

  numberDisplay.style.animation = 'none';
  void numberDisplay.offsetWidth;
  numberDisplay.style.animation = '';

  numberDisplay.textContent = item.number;
  progressLabel.textContent = `Число ${idx + 1} з ${TOTAL}`;
  progressFill.style.width = `${(idx / TOTAL) * 100}%`;

  setStatus('Натисни Listen або Speak');
  setLocked(false);
};

const normalize = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[.?!,]/g, '')
    .replace(/-/g, ' ');

const nextNumber = () => {
  idx++;
  idx >= TOTAL ? showResult() : showNumber();
};

export const checkAnswer = (raw) => {
  const input = normalize(raw);
  const correct_ = normalize(session[idx].en);

  if (input === correct_) {
    correct++;
    setStatus('Молодець! ✅', 'success');
    setLocked(true);
    setTimeout(nextNumber, 2000);
  } else {
    wrong++;
    setStatus(`Не засмучуйся! Правильно: "${session[idx].en}" ❌`, 'error');
    setLocked(true);
    speak(session[idx].en, () => nextNumber());
  }
};

export const handleListen = () => {
  if (locked) return;
  setLocked(true);
  speak(session[idx].en, () => setLocked(false));
};

const showResult = () => {
  saveSession(correct, wrong, 'numbers');
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

  document.getElementById('resultScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');

  showNumber();
};
