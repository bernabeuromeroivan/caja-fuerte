import './style.css';
import { supabase } from './supabase.js';
import { startGame, TIME_LIMIT } from './game.js';

const $ = (id) => document.getElementById(id);
const views = ['loading', 'login', 'home', 'game', 'result', 'history'];
let currentGame = null;
let session = null;

function show(name) {
  views.forEach((v) => ($(`view-${v}`).hidden = v !== name));
}

function render() {
  const logged = !!session;
  $('userbox').hidden = !logged;
  if (!logged) {
    stopGame();
    show('login');
    return;
  }
  const u = session.user;
  $('user-name').textContent = u.user_metadata?.full_name || u.email;
}

function stopGame() {
  if (currentGame) {
    currentGame.stop();
    currentGame = null;
  }
}

async function emailLogin(e) {
  e.preventDefault();
  $('login-error').textContent = '';
  $('login-info').textContent = '';
  const { error } = await supabase.auth.signInWithPassword({
    email: $('email').value.trim(),
    password: $('password').value,
  });
  if (error) $('login-error').textContent = error.message;
}

async function emailSignup() {
  $('login-error').textContent = '';
  $('login-info').textContent = '';
  const form = $('email-form');
  if (!form.reportValidity()) return;
  const { data, error } = await supabase.auth.signUp({
    email: $('email').value.trim(),
    password: $('password').value,
  });
  if (error) {
    $('login-error').textContent = error.message;
  } else if (!data.session) {
    $('login-info').textContent = 'Cuenta creada. Revisa tu correo para confirmarla y luego pulsa Entrar.';
  }
}

async function logout() {
  stopGame();
  await supabase.auth.signOut();
}

function playGame() {
  stopGame();
  $('hud-time').textContent = TIME_LIMIT;
  $('hud-moves').textContent = 0;
  show('game');
  currentGame = startGame({
    board: $('board'),
    onTick: (t) => ($('hud-time').textContent = t),
    onMove: (m) => ($('hud-moves').textContent = m),
    onEnd: handleEnd,
  });
}

async function handleEnd(partida) {
  currentGame = null;
  $('result-title').textContent = partida.resultado === 'victoria' ? '🎉 ¡Victoria!' : '⌛ Se acabó el tiempo';
  $('result-score').textContent = partida.puntuacion;
  $('result-duration').textContent = partida.duracion;
  $('result-moves').textContent = partida.movimientos;
  $('save-status').textContent = 'Guardando partida…';
  $('save-status').className = 'muted';
  show('result');

  const { error } = await supabase.from('partidas').insert({
    user_id: session.user.id,
    ...partida,
  });
  if (error) {
    $('save-status').textContent = 'No se pudo guardar la partida: ' + error.message;
    $('save-status').className = 'error';
  } else {
    $('save-status').textContent = '✅ Partida guardada';
  }
}

async function showHistory() {
  stopGame();
  show('history');
  $('history-error').textContent = '';
  const body = $('history-body');
  body.replaceChildren();

  const { data, error, count } = await supabase
    .from('partidas')
    .select('fecha, resultado, puntuacion, duracion', { count: 'exact' })
    .order('fecha', { ascending: false });

  if (error) {
    $('history-error').textContent = 'Error al cargar el historial: ' + error.message;
    return;
  }
  $('history-total').textContent = count ?? data.length;

  if (!data.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.textContent = 'Todavía no has jugado ninguna partida.';
    tr.append(td);
    body.append(tr);
    return;
  }
  data.forEach((p) => {
    const tr = document.createElement('tr');
    const cells = [
      new Date(p.fecha).toLocaleString('es-ES'),
      p.resultado === 'victoria' ? '🏆 Victoria' : '❌ Derrota',
      p.puntuacion,
      p.duracion + ' s',
    ];
    cells.forEach((c) => {
      const td = document.createElement('td');
      td.textContent = c;
      tr.append(td);
    });
    body.append(tr);
  });
}

function goHome() {
  stopGame();
  show('home');
}

// Eventos
$('email-form').addEventListener('submit', emailLogin);
$('signup').addEventListener('click', emailSignup);
$('logout').addEventListener('click', logout);
$('start').addEventListener('click', playGame);
$('again').addEventListener('click', playGame);
$('abandon').addEventListener('click', goHome);
$('nav-play').addEventListener('click', goHome);
$('nav-history').addEventListener('click', showHistory);
$('to-history').addEventListener('click', showHistory);

// Sesión: se mantiene al recargar y reacciona a login/logout
supabase.auth.onAuthStateChange((event, newSession) => {
  const wasLogged = !!session;
  session = newSession;
  render();
  if (session && !wasLogged) {
    // limpia el hash/query que deja OAuth
    if (window.location.hash || window.location.search) {
      history.replaceState(null, '', window.location.pathname);
    }
    goHome();
  }
});

supabase.auth.getSession().then(({ data }) => {
  session = data.session;
  render();
  if (session) goHome();
});

async function googleLogin() {
  $('login-error').textContent = '';
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin, // Vuelve a tu web tras el login
    },
  });
  if (error) $('login-error').textContent = error.message;
}

// En la sección de Eventos, añade:
$('google-login').addEventListener('click', googleLogin);
