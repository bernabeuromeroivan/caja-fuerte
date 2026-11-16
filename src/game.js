const EMOJIS = ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐵', '🐧'];
export const TIME_LIMIT = 120;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function startGame({ board, onTick, onMove, onEnd }) {
  const cards = shuffle([...EMOJIS, ...EMOJIS]);
  let first = null;
  let lock = false;
  let moves = 0;
  let matched = 0;
  let fails = 0;
  let finished = false;
  const startedAt = Date.now();
  let flipTimeout = null;

  board.replaceChildren();
  cards.forEach((emoji) => {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.type = 'button';
    btn.dataset.emoji = emoji;
    btn.setAttribute('aria-label', 'Carta');
    btn.addEventListener('click', () => flip(btn));
    board.append(btn);
  });

  const timer = setInterval(() => {
    const remaining = TIME_LIMIT - (Date.now() - startedAt) / 1000;
    onTick(Math.max(0, Math.ceil(remaining)));
    if (remaining <= 0) finish('derrota');
  }, 250);

  function flip(btn) {
    if (finished || lock) return;
    if (btn.classList.contains('flipped') || btn.classList.contains('matched')) return;
    btn.classList.add('flipped');
    btn.textContent = btn.dataset.emoji;

    if (!first) {
      first = btn;
      return;
    }
    moves++;
    onMove(moves);
    const a = first;
    first = null;
    if (a.dataset.emoji === btn.dataset.emoji) {
      a.classList.add('matched');
      btn.classList.add('matched');
      matched++;
      if (matched === EMOJIS.length) finish('victoria');
    } else {
      fails++;
      lock = true;
      flipTimeout = setTimeout(() => {
        [a, btn].forEach((c) => {
          c.classList.remove('flipped');
          c.textContent = '';
        });
        lock = false;
      }, 700);
    }
  }

  function finish(resultado) {
    if (finished) return;
    finished = true;
    clearInterval(timer);
    clearTimeout(flipTimeout);
    const duracion = Math.min(TIME_LIMIT, Math.round((Date.now() - startedAt) / 1000));
    const bonus = resultado === 'victoria' ? (TIME_LIMIT - duracion) * 5 : 0;
    const puntuacion = Math.max(0, matched * 100 + bonus - fails * 10);
    onEnd({ resultado, puntuacion, duracion, movimientos: moves });
  }

  return {
    stop() {
      finished = true;
      clearInterval(timer);
      clearTimeout(flipTimeout);
    },
  };
}
