// programs/419-enter-nether-portal.js
console.log('=== Step: Step through base door and enter Nether Portal ===');
console.log('Current pos:', lib.fmt(bot.entity.position));
console.log('Current dimension:', bot.game.dimension);

// 1. Step through base door
try {
  await lib.goThroughDoor(294, 72, -54, { close: false });
  console.log('Outside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door note:', e.message);
}

// 2. Announce Nether departure
bot.chat('beta: Milestone 3 COMPLETE! All 4 players geared. Stepping into Nether portal (299, 73, -54) with 110 cobblestone for Nether bunker!');

// 3. Walk to Nether portal blocks at (299, 73, -54)
const portalTarget = new Vec3(299, 73, -54);
console.log(`Walking to portal at ${lib.fmt(portalTarget)}...`);

try {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5);
} catch (err) {
  console.log('GoTo portal note:', err.message);
}

// 4. Stand inside portal block and wait for teleportation
console.log('Standing in portal, waiting for Nether teleportation...');
for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
    console.log(`TELEPORTED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

console.log(`Final pos: ${lib.fmt(bot.entity.position)}, dimension: ${bot.game.dimension}`);
bot.chat(`beta: Nether status: Dimension=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, Health=${bot.health}/20, Food=${bot.food}/20.`);
