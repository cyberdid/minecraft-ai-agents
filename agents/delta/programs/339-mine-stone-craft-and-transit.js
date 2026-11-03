// programs/339-mine-stone-craft-and-transit.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Equip wooden_pickaxe
const woodPick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (woodPick) await bot.equip(woodPick, 'hand');

// 1. Mine 3 cobblestone
console.log('Mining 3 cobblestone with wooden pickaxe...');
await lib.collect('cobblestone', 3);
console.log('Cobblestone count:', lib.count('cobblestone'));

// 2. Craft stone_pickaxe
console.log('Crafting stone_pickaxe...');
await lib.craft('stone_pickaxe', 1);
const stonePick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (stonePick) await bot.equip(stonePick, 'hand');
console.log('Stone pickaxe equipped!');

// 3. Mine 24 cobblestone with stone pickaxe
console.log('Mining 24 cobblestone...');
await lib.collect('cobblestone', 24);
console.log('Cobblestone count:', lib.count('cobblestone'));

// 4. Craft stone_sword
if (lib.count('stick') < 1) {
  if (lib.count('*_log') > 0) {
    const l = bot.inventory.items().find(i => i.name.endsWith('_log'));
    await lib.craft(l.name.replace('_log', '_planks'), 4);
  }
  await lib.craft('stick', 4);
}
console.log('Crafting stone_sword...');
await lib.craft('stone_sword', 1);
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');
console.log('Armed with stone sword! Cobble:', lib.count('cobblestone'));
bot.chat(`delta: Armed with stone sword & ${lib.count('cobblestone')} cobble! Entering Nether portal!`);

// 5. Move to Nether Portal at (299.5, 73.0, -53.5)
console.log('Moving to Nether Portal...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 20000 });
} catch (e) {
  console.log('goTo note:', e.message);
}

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
  new Vec3(36.0, 67.0, -187)  // Spawner Balcony Deck
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

console.log('Arrived at Spawner Deck! Pos:', lib.fmt(bot.entity.position));
bot.chat(`delta: Arrived on Spawner Balcony deck ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble & stone sword! Slaying Blazes for Rods!`);

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
