// programs/876-enter-nether-portal.js
console.log('=== Program 876: Enter Nether Portal ===');
globalThis.isProgramCancelled = isCancelled;

bot.chat('Beta: Portal is lit! Warping into the Nether now for Milestone 9!');

const res = await enterNetherPortal(30000);
console.log('enterNetherPortal result:', res);

console.log(`Current dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

if (bot.game.dimension === 'the_nether') {
  bot.chat(`Beta: Arrived in the Nether at ${lib.fmt(bot.entity.position)}! Ready for Piglin bartering!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position
};
