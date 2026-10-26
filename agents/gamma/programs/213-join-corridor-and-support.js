// programs/213-join-corridor-and-support.js
console.log('--- JOIN DELTA & ALPHA AT BLAZE ASSAULT CORRIDOR ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// Equip stone_sword
await lib.equipWeapon();

// 1. Walk carefully forward along x=44 from z=-155 to z=-162 inside Delta's enclosed corridor
for (let z = -155; z >= -163; z--) {
  const flr = bot.blockAt(new Vec3(44, 64, z));
  console.log(`z=${z}: flr=${flr?.name || 'AIR'}`);
  if (!flr || flr.boundingBox !== 'block') {
    console.log(`Placing floor at (44, 64, ${z})...`);
    try { await lib.place('cobblestone', 44, 64, z); } catch (e) {}
  }
  await lib.walkTo(44.5, z + 0.5, 2000);
}

console.log('Arrived at corridor front! Pos:', lib.fmt(bot.entity.position));

// 2. Check teammates positions
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`Teammate ${p.username}: ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m)`);
  }
}

// 3. Scan hostiles within 16m
const hostiles = lib.hostiles(16);
console.log(`Hostiles within 16m (${hostiles.length}):`, JSON.stringify(hostiles));

// 4. Check for dropped items (blaze_rod, equipment)
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 16);
console.log(`Dropped items within 16m (${items.length}):`, items.map(i => `${lib.fmt(i.position)} (dist: ${bot.entity.position.distanceTo(i.position).toFixed(1)}m)`));

// 5. If blaze within 4m melee reach, attack!
const nearBlaze = bot.nearestEntity(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 4.5);
if (nearBlaze) {
  console.log(`Blaze within melee reach at ${lib.fmt(nearBlaze.position)}! Attacking...`);
  await bot.lookAt(nearBlaze.position);
  for (let h = 0; h < 5 && nearBlaze.isValid; h++) {
    bot.attack(nearBlaze);
    await sleep(650);
  }
  await lib.pickup(4);
}

// Report in chat
bot.chat(`gamma joined Delta & Alpha at corridor front ${lib.fmt(bot.entity.position)}! HP: ${bot.health.toFixed(1)}/20. Blaze rods in inv: ${lib.count('blaze_rod')}`);

console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
