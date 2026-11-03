// programs/417-go-to-portal-and-enter.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Walk from current position to outside the portal at (299, 72, -52)
if (bot.game.dimension === 'overworld') {
  console.log('Navigating to portal approach (299, 72, -52)...');
  try {
    await lib.goTo(299, 72, -52, 2, { timeoutMs: 40000 });
    console.log('Reached portal approach! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('goTo portal approach error:', e.message);
  }
}

// 2. Enter Nether Portal
console.log('Entering Nether Portal...');
const portalRes = await enterNetherPortal();
console.log('enterNetherPortal result:', JSON.stringify(portalRes));
console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
