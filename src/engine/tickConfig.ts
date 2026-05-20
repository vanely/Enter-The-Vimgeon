/** Global simulation interval (movement, projectiles, enemy AI, cooldown ticks). */
export const TICK_RATE_MS = 80;

/** Melee (`x`) spacing: ~1s wall-clock at the current tick rate. */
export const MELEE_COOLDOWN_TICKS = Math.ceil(1000 / TICK_RATE_MS);
