// programs/494-return-to-portal-and-enter-nether.js
console.log('=== Step: Return to Base Portal & Enter the Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Walk in stages from (200, 62, -33) to base (294, 72, -55)
const waypoints = [
  new Vec3(230, 64, -40),
  new Vec3(260, 68, -48),
  new Vec3(290, 72, -54),
  new Vec3(294, 72, -55)
];

for (const wp of waypoints) {
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.5);
    console.log(`Reached waypoint ${lib.fmt(wp)}`);
  } catch (e) {
    console.log(`WP ${lib.fmt(wp)} path error, continuing:`, e.message);
    try { await lib.walkTo(wp.x, wp.z); } catch (e2) {}
  }
}

console.log('At base area:', lib.fmt(bot.entity.position));

// 2. Check base chest (293, 72, -57) for gear/food
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Base chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
    for (const item of items) {
      if (item.name.startsWith('cooked_') || item.name.startsWith('iron_') || item.name === 'shield' || item.name === 'bread') {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.name}x${item.count} from chest!`);
      }
    }
    chest.close();
  } catch (e) {}
}

// Equip best armor
try { await lib.equipArmor(); } catch (e) {}

// 3. Step into Nether portal at (298, 72, -54) / (299, 73, -54)
console.log('Stepping into Nether Portal...');
try {
  await lib.goTo(298.5, 72.0, -54.0, 0.5);
} catch (e) {
  await lib.walkTo(298.5, -54.0);
}

// Wait for dimension transit (up to 14s)
for (let i = 0; i < 14; i++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
    console.log('SUCCESS: TRANSITED TO THE NETHER!');
    break;
  }
}

console.log('Final dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
bot.chat(`beta: In dimension ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}! Moving to Fortress Outpost!`);
