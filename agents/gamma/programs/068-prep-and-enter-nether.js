// programs/068-prep-and-enter-nether.js
console.log('--- PREP & NETHER TRANSITION ---');
console.log('Current pos:', lib.fmt(bot.entity.position));
console.log('Current dim:', bot.game.dimension);

// 1. Craft sticks & torches
if (lib.count('stick') < 4 && lib.count('*_planks') >= 2) {
  await lib.craft('stick', 4);
}
if (lib.count('coal') >= 4 && lib.count('stick') >= 4) {
  console.log('Crafting torches...');
  await lib.craft('torch', 16);
}

// 2. Withdraw more cobbled_deepslate from chest (293, 72, -57)
try {
  const chest = await lib.chestContents(293, 72, -57);
  if (chest.cobbled_deepslate >= 32) {
    console.log('Withdrawing 32 cobbled_deepslate...');
    await lib.withdraw({ cobbled_deepslate: 32 }, 293, 72, -57);
  }
} catch (e) {
  console.log('Chest withdraw error:', e.message);
}

console.log('Inventory before departure:', JSON.stringify(lib.inv()));
bot.chat('gamma ready for Nether transit with torches and bunker blocks!');

// 3. Step out through door
console.log('Exiting base door (294, 72, -54)...');
await lib.goThroughDoor(294, 72, -54);
console.log('Outside door at:', lib.fmt(bot.entity.position));

// 4. Approach portal (299, 73, -54)
console.log('Moving into Nether portal at (299.5, 73.0, -54.0)...');
const portalGoal = new goals.GoalBlock(299, 73, -54);
await bot.pathfinder.goto(portalGoal);

console.log('Inside portal frame! Waiting for Nether transition...');
const startTransit = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - startTransit < 30000) && !isCancelled()) {
  await sleep(1000);
  console.log(`Waiting in portal... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
}

console.log('Transit complete!');
console.log('Current dimension:', bot.game.dimension);
console.log('Current position:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// Check teammates in Nether
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Player ${name} visible at: ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat(`gamma has arrived in the Nether at ${lib.fmt(bot.entity.position)}! Team: please share food at bunker.`);
