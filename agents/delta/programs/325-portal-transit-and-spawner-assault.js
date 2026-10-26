// programs/325-portal-transit-and-spawner-assault.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food, 'Cobble:', lib.count('cobblestone'));

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
await sleep(100);

// 1. Move to Overworld Nether Portal
console.log('Ascending to Nether Portal at (299.5, 73.0, -53.5)...');
try {
  await lib.goTo(299, 72, -52, 2, { dig: true, timeoutMs: 20000 });
} catch (e) {
  console.log('goTo portal note:', e.message);
  await bot.lookAt(new Vec3(299, 73, -52), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(2500);
  bot.clearControlStates();
}

// Step onto portal sill y=73 and walk into center
console.log('Stepping into portal frame...');
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

bot.chat(`delta: In Nether with stone sword & ${lib.count('cobblestone')} cobblestone! Sprinting corridor to Spawner Frontline!`);

// 2. Safe exit at z=-8.0
console.log('Exiting bunker at z=-8.0...');
await lib.walkTo(40.5, -8.0, 2000);
bot.clearControlStates();

// 3. Move along valley floor to East Ridge (63, 65, -8)
const toRidge = [
  new Vec3(48, 65, -8),
  new Vec3(56, 65, -8),
  new Vec3(63, 65, -8)
];
for (const wp of toRidge) {
  try { await lib.goTo(wp.x, wp.y, wp.z, 1, { timeoutMs: 8000 }); } catch (e) {}
}

// 4. Sprint through proven open corridor to frontline
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
  new Vec3(38.0, 65.0, -176)  // Fortified Cross-Bridge
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

console.log('Arrived at fortified cross-bridge! Pos:', lib.fmt(bot.entity.position));
bot.chat(`delta: United at Spawner Bridgehead ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble & stone sword! Ready to breach Spawner!`);

// Equip stone_sword
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');

console.log('Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
