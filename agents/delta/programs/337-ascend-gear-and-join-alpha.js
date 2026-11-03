// programs/337-ascend-gear-and-join-alpha.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Craft stone_pickaxe with current supplies
console.log('Crafting stone_pickaxe...');
await lib.craft('stone_pickaxe', 1);
console.log('Stone pickaxe crafted!');

// 2. Ascend to surface base at (294, 72, -54)
console.log('Ascending to surface base...');
try {
  await lib.goTo(294, 72, -54, 2, { dig: true, timeoutMs: 20000 });
} catch (e) {
  console.log('Ascend note:', e.message);
}
console.log('At surface pos:', lib.fmt(bot.entity.position));

// 3. Mine 24 cobblestone with stone pickaxe
console.log('Mining 24 cobblestone...');
try {
  await lib.collect('cobblestone', 24);
} catch (e) {
  console.log('Cobble collect note:', e.message);
}
console.log('Cobblestone count:', lib.count('cobblestone'));

// 4. Craft stone_sword
if (lib.count('stick') < 1) {
  if (lib.count('*_planks') >= 2) await lib.craft('stick', 4);
}
if (lib.count('stick') >= 1 && lib.count('cobblestone') >= 2) {
  await lib.craft('stone_sword', 1);
  console.log('Stone sword crafted!');
}

const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) await bot.equip(sword, 'hand');

// 5. Step into Nether portal at (299.5, 73.0, -53.5)
console.log('Moving to Nether Portal...');
try {
  await lib.goTo(299, 72, -52, 1);
} catch (e) {}

bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.clearControlStates();

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (!String(bot.game.dimension).includes('nether')) {
  console.log('Transit incomplete, holding.');
  return;
}

bot.chat(`delta: In Nether armed with stone sword & ${lib.count('cobblestone')} cobble! Sprinting to join Alpha at Spawner deck!`);

// 6. Safe exit at z=-8.0
console.log('Exiting bunker at z=-8.0...');
await lib.walkTo(40.5, -8.0, 2000);
bot.clearControlStates();

// 7. Follow valley floor to East Ridge (63, 65, -8)
const toRidge = [
  new Vec3(48, 65, -8),
  new Vec3(56, 65, -8),
  new Vec3(63, 65, -8)
];
for (const wp of toRidge) {
  try { await lib.goTo(wp.x, wp.y, wp.z, 1, { timeoutMs: 8000 }); } catch (e) {}
}

// 8. Sprint through covered corridor to frontline
const corridor = [
  new Vec3(63.0, 65.0, -15),
  new Vec3(63.0, 65.0, -30),
  new Vec3(62.0, 65.0, -50),
  new Vec3(62.0, 65.0, -70),
  new Vec3(62.0, 65.0, -90),
  new Vec3(61.0, 65.0, -100),
  new Vec3(50.0, 65.0, -115),
  new Vec3(44.0, 65.0, -127), // Fortress Workshop Bunker
  new Vec3(44.0, 65.0, -145), // Covered Advance Tunnel
  new Vec3(44.0, 65.0, -160),
  new Vec3(44.0, 65.0, -169), // Frontline Blast Wall
  new Vec3(38.0, 65.0, -176), // Fortified Cross-Bridge
  new Vec3(37.0, 65.0, -183)  // Spawner Balcony Deck with Alpha!
];

for (let i = 0; i < corridor.length && !isCancelled(); i++) {
  const wp = corridor[i];
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1));
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1500);
    bot.clearControlStates();
  }
  try { await lib.pickup(6); } catch (e) {}
}

console.log('Arrived at Spawner Deck with Alpha! Pos:', lib.fmt(bot.entity.position));
bot.chat(`delta: United with Alpha on Spawner Balcony deck ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble & sword! Slaying Blazes for Rods!`);

// Attack any Blaze within 4m
const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 5);
if (blazes.length > 0) {
  console.log(`Blaze in melee range! Attacking...`);
  await bot.attack(blazes[0]);
}

// Pickup drops (Blaze rods)
try { await lib.pickup(8); } catch (e) {}

console.log('Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
