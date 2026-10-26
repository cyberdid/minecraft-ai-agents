// programs/207-finish-arm-and-nether-sprint.js
console.log('--- FINISH CRAFTING TOOLS & SPRINT TO ALPHA AT BLAZE FRONT ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Craft sticks and wooden pickaxe from our 8 planks
console.log('Crafting sticks & wooden_pickaxe...');
await lib.craft('stick', 4);
await lib.craft('wooden_pickaxe', 1);
console.log('Wooden pickaxe crafted!');

// 2. Mine 12 stone on hillside
console.log('Mining 12 stone...');
await lib.collect('stone', 12);
console.log('Cobble mined! Count:', lib.count('cobblestone'));

// 3. Craft stone pickaxe and sword
if (lib.count('cobblestone') >= 5) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  await lib.craft('stone_pickaxe', 1);
  await lib.craft('stone_sword', 1);
  await lib.equipWeapon();
  console.log('Stone tools crafted! Tools:', JSON.stringify(lib.tools()));
}

console.log('Inv before portal:', JSON.stringify(lib.inv()));
bot.chat(`gamma armed with stone sword, pickaxe & cobble! Sprinting to Nether portal.`);

// 4. Walk south path to Overworld Nether portal (299.5, 73.0, -53.5)
console.log('Moving to portal south path...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 15000 });
} catch (e) {
  try { await lib.walkTo(299.5, -52.0, 4000); } catch (e2) {}
}

// Step up into portal block
bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.setControlState('jump', false);
bot.clearControlStates();

console.log('Inside portal frame! Pos:', bot.entity.position);

// 5. Stand still for transit
console.log('Waiting for transit to Nether...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
  console.log(`Waiting in portal... dim=${bot.game.dimension}`);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within deadline');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));

// 6. Step out to bunker floor (40.5, 65, -5.0)
await lib.walkTo(40.5, -5.0, 3000);
bot.clearControlStates();

bot.chat(`gamma arrived in Nether bunker ${lib.fmt(bot.entity.position)}! Sprinting through covered tunnel to Alpha at (44, 65, -161).`);

// 7. Sprint through covered East Ridge tunnel to Fortress Workshop and Alpha
const waypoints = [
  new Vec3(63, 65, -3),
  new Vec3(63, 65, -30),
  new Vec3(62, 65, -60),
  new Vec3(62, 65, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -140),
  new Vec3(44, 65, -155),
  new Vec3(44, 65, -160)
];

for (let i = 0; i < waypoints.length; i++) {
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 15000 });
  } catch (e) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 10000 }); } catch (e2) {}
  }
}

console.log('Arrived at Blaze front! Final pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

// Check teammates at destination
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`Teammate ${p.username}: ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m)`);
  }
}

bot.chat(`gamma reached Blaze Spawner battlements at ${lib.fmt(bot.entity.position)}! United with Alpha to farm Blaze Rods!`);
