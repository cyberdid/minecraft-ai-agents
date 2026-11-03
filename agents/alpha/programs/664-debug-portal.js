// programs/664-debug-portal.js
console.log('Bot pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

const pStart = Date.now();
console.log('Calling enterNetherPortal()...');
try {
  const res = await enterNetherPortal();
  console.log('enterNetherPortal returned:', res, 'took:', Date.now() - pStart, 'ms');
} catch (e) {
  console.log('enterNetherPortal threw:', e.message);
}
console.log('After call pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
