// programs/392-step-into-portal-and-join-nether-team.js
console.log('=== Program 392: Step into Portal & Join Nether Team ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Step directly into the portal block
console.log('Stepping into portal block (299.5, 73.0, -54.0)...');
await bot.lookAt(new Vec3(299.5, 73.0, -54.0));
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(600);
bot.setControlState('jump', false);
await sleep(400);
bot.setControlState('forward', false);

// 2. Wait for Nether teleportation
console.log('Waiting for Nether transit...');
for (let wait = 0; wait < 25; wait++) {
  if (bot.game.dimension === 'the_nether') {
    console.log('*** ARRIVED IN THE NETHER! ***');
    break;
  }
  await sleep(500);
}

console.log('Current dimension:', bot.game.dimension);
console.log('Alpha position:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat('team: Alpha arrived in Nether bunker! Teaming with Gamma & Delta to push to Fortress (45, 65, -128)!');

  // Check nearby bunker chest for gear/gold
  const nearbyChests = bot.findBlocks({ matching: mcData.blocksByName.chest?.id, maxDistance: 8, count: 2 });
  if (nearbyChests.length > 0) {
    try {
      const cp = nearbyChests[0];
      const items = await lib.chestContents(cp.x, cp.y, cp.z);
      console.log('Bunker chest contents:', JSON.stringify(items));
    } catch (e) {}
  }

  // Scan teammates
  for (const name of ['gamma', 'delta', 'beta']) {
    const p = bot.players[name];
    if (p && p.entity) {
      console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
    }
  }
}

console.log('Alpha inventory:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
