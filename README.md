# 🧠 Memoria Animal

Juego de memoria desarrollado para el reto **La caja fuerte digital**.

## Reglas
- 16 cartas boca abajo con 8 parejas de animales.
- En cada turno se descubren dos cartas: si coinciden, se quedan visibles.
- Hay que encontrar todas las parejas en **120 segundos**; si no, la partida termina en derrota.
- Puntuación: 100 puntos por pareja, +5 por cada segundo restante (solo si ganas) y −10 por cada fallo.

## Funcionalidades
- Inicio de sesión con email y contraseña (Supabase Auth), sesión persistente y cierre de sesión.
- Cada partida terminada se guarda en PostgreSQL (tabla `partidas`).
- Historial personal: fecha, resultado, puntuación, duración y total de partidas.
- Row Level Security: cada usuario solo ve e inserta sus propias partidas.
- Diseño responsive con controles táctiles.

## Tecnologías
HTML5, CSS3, JavaScript Vanilla, Vite, Supabase (PostgreSQL + Auth + RLS), GitHub.

## Ejecutar en local
1. `npm install`
2. Copia `.env.example` a `.env` y rellena tu URL y *publishable key* de Supabase.
3. Ejecuta `supabase/schema.sql` en el SQL Editor de Supabase.
4. En Supabase → Authentication → Providers, deja activado Email (puedes desactivar "Confirm email" para probar).
5. `npm run dev`

## Despliegue
Build: `npm run build` (carpeta `dist`). En Vercel/Netlify define las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`, y añade la URL pública en Supabase → Authentication → URL Configuration (Site URL y Redirect URLs).

> No se incluyen claves privadas en el repositorio. La *publishable key* es pública por diseño; la seguridad la garantiza RLS.
