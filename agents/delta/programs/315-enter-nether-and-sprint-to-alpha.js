// programs/315-enter-nether-and-sprint-to-alpha.js
console.log('Delta start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Cobblestone:', lib.count('cobblestone'), 'Swords:', lib.count('stone_sword'));

// 1. If in Overworld, climb/walk to Nether Portal
if (!String(bot.game.dimension).includes('nether')) {
  console.log('Ascending to surface base at (299, 72, -52)...');
  try {
    await lib.goTo(299, 72, -52, 2, { dig: true, timeoutMs: 20000 });
  } catch (e) {
    console.log('lib.goTo surface note:', e.message);
  }

  // Step onto portal sill y=73 and walk into center
  console.log('Stepping into portal frame at (299.5, 73.0, -53.5)...');
  bot.setControlState('jump', true);
  await lib.walkTo(299.5, -53.5, 4000);
  bot.clearControlStates();

  console.log('Waiting for Nether teleport...');
  const t0 = Date.now();
  while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
    await sleep(500);
  }
}

console.log('Dimension now:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (!String(bot.game.dimension).includes('nether')) {
  console.log('Not in Nether! Aborting.');
  return;
}

bot.chat(`delta: In Nether with stone sword & ${lib.count('cobblestone')} cobblestone! Sprinting corridor to join Alpha at Spawner Front!`);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
await sleep(100);

// 2. Safe exit strictly at z = -8.0
console.log('Exiting bunker at z=-8.0...');
await lib.walkTo(40.5, -8.0, 2000);
bot.clearControlStates();

// 3. Move East along valley floor to (63, 65, -8)
const toRidge = [
  new Vec3(48, 65, -8),
  new Vec3(56, 65, -8),
  new Vec3(63, 65, -8)
];
for (const wp of toRidge) {
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1, { timeoutMs: 10000 });
  } catch (e) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 6000 }); } catch (e2) {}
  }
}

// 4. Sprint through proven open corridor to frontline
const corridorWaypoints = [
  { name: 'Corridor Start', pos: new Vec3(63.0, 65.0, -15) },
  { name: 'Corridor End', pos: new Vec3(63.0, 65.0, -30) },
  { name: 'Ridge South', pos: new Vec3(62.0, 65.0, -50) },
  { name: 'Ridge Mid', pos: new Vec3(62.0, 65.0, -70) },
  { name: 'Ridge North', pos: new Vec3(62.0, 65.0, -90) },
  { name: 'Ridge Bend', pos: new Vec3(61.0, 65.0, -100) },
  { name: 'Fortress Approach', pos: new Vec3(50.0, 65.0, -115) },
  { name: 'Fortress Workshop Bunker', pos: new Vec3(44.0, 65.0, -127) },
  { name: 'Covered Tunnel Mid', pos: new Vec3(44.0, 65.0, -145) },
  { name: 'Covered Tunnel North', pos: new Vec3(44.0, 65.0, -160) },
  { name: 'Frontline Blast Wall', pos: new Vec3(44.0, 65.0, -169) }
];

for (let i = 0; i < corridorWaypoints.length && !isCancelled(); i++) {
  const wp = corridorWaypoints[i];
  console.log(`[WP ${i + 1}/${corridorWaypoints.length}] Heading to ${wp.name} at ${lib.fmt(wp.pos)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.pos.x, wp.pos.y, wp.pos.z, 1));
    console.log(`Reached ${wp.name} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Path note to ${wp.name}:`, e.message);
    await bot.lookAt(new Vec3(wp.pos.x, wp.pos.y + 1, wp.pos.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1500);
    bot.clearControlStates();
  }

  // Pick up drops
  try { await lib.pickup(6); } catch (e) {}
}

console.log('Arrived at Frontline! Pos:', lib.fmt(bot.entity.position));
bot.chat(`delta: United with Alpha at Spawner Frontline ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble & stone sword! Ready to enclose Spawner!`);

// Equip stone_sword
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');

console.log('Current Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
