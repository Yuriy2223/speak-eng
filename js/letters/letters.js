import { startGame, handleListen, checkAnswer, setStatus, setLocked, isLocked } from './game.js';
import { isSRSupported, startRecognition } from '../shared/speech.js';

document.getElementById('btnPlayAgain').addEventListener('click', startGame);
document.getElementById('btnListen').addEventListener('click', handleListen);

const speakBtn = document.getElementById('btnSpeak');

if (!isSRSupported()) {
  const msg = document.createElement('div');
  msg.className   = 'no-support-msg';
  msg.textContent = 'Ваш браузер не підтримує розпізнавання голосу. Використайте Chrome.';
  speakBtn.replaceWith(msg);
} else {
  speakBtn.addEventListener('click', () => {
    if (isLocked()) return;

    let rec = null;
    const stopRec = () => {
      speakBtn.classList.remove('recording');
      speakBtn.textContent = '🎤 Speak';
      rec?.stop();
    };

    setLocked(true);
    speakBtn.classList.add('recording');
    speakBtn.textContent = 'Listening... 🎤';
    setStatus('Слухаю...', 'info');

    rec = startRecognition({
      onResult:  t => { stopRec(); checkAnswer(t); },
      onNoMatch: () => { stopRec(); setStatus('Спробуй ще раз 🎤', 'warn'); setLocked(false); },
      onError:   code => {
        stopRec();
        if (code === 'not-allowed') { setStatus('Мікрофон заблоковано.', 'error'); speakBtn.remove(); }
        else setStatus('Не вдалось розпізнати. Спробуй ще раз.', 'warn');
        setLocked(false);
      },
    });
  });
}

startGame();
