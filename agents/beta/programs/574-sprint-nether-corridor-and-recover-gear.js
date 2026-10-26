// programs/574-sprint-nether-corridor-and-recover-gear.js
console.log('=== Step: Sprint Nether Covered Ridge & Recover Drops at Front (z=-157) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

if (!bot.game.dimension.includes('nether')) {
  throw new Error('Not in the Nether! Current dim: ' + bot.game.dimension);
}

// 1. Craft wooden sword
if (lib.count('wooden_sword') < 1 && lib.count('*_planks') >= 2) {
  try {
    await lib.craft('wooden_sword', 1);
    await lib.equipWeapon();
    console.log('Crafted & equipped wooden_sword!');
  } catch (e) {
    console.log('Sword craft note:', e.message);
  }
}

// 2. Step East out of bunker and mine 8-12 netherrack
console.log('Exiting bunker East to (46, 65, -7)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(46, 65, -7, 1));
} catch (e) {
  await bot.lookAt(new Vec3(46, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.clearControlStates();
}

for (let d = 0; d < 8; d++) {
  if (lib.count('netherrack') >= 12) break;
  const nr = bot.findBlock({ matching: mcData.blocksByName.netherrack.id, maxDistance: 4 });
  if (nr) {
    try {
      await lib.dig(nr.position.x, nr.position.y, nr.position.z);
      await lib.pickup(3);
    } catch (e) {}
  }
}
console.log('Netherrack mined:', lib.count('netherrack'));

// 3. Sprint through covered East Ridge to frontline
const waypoints = [
  new Vec3(63, 64, -5),
  new Vec3(63, 66, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(54, 65, -90),
  new Vec3(44, 66, -127),
  new Vec3(44, 65, -141),
  new Vec3(44, 65, -149),
  new Vec3(44, 65, -157),
  new Vec3(44, 65, -160)
];

bot.chat('beta: Sprinting through covered Nether ridge to recover gear and reinforce Spawner front at (44, 65, -160)!');

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i+1}/${waypoints.length}: ${lib.fmt(wp)} (HP=${bot.health.toFixed(1)})...`);

  // Extinguish fire near path
  const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
  const fires = bot.findBlocks({ matching: fireIds, maxDistance: 3, count: 4 });
  for (const fp of fires) {
    try { await lib.dig(fp.x, fp.y, fp.z); } catch (e) {}
  }

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
    console.log(`Reached WP ${i+1}: ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`WP ${i+1} path note:`, err.message);
    try { await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false }); } catch (e2) {}
  }

  // Pick up drops along hallway (especially around z=-157)
  if (wp.z <= -127) {
    await lib.pickup(8);
    await lib.equipArmor();
    await lib.equipWeapon();
    if (bot.food < 18) {
      try { await lib.eat(); } catch (e) {}
    }
  }
}

// 4. Arrived at frontline baffle wall (44, 65, -160)
console.log('Arrived at frontline! Pos:', lib.fmt(bot.entity.position));
await lib.pickup(10);
await lib.equipArmor();
await lib.equipWeapon();
if (bot.food < 18) {
  try { await lib.eat(); } catch (e) {}
}

const spawnerPos = new Vec3(32, 68, -190);
const distToSpawner = bot.entity.position.distanceTo(spawnerPos);
const cobble = lib.count('cobblestone') + lib.count('netherrack');
const shield = lib.count('shield');
const invSummary = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');

console.log(`FRONT STATUS: Pos=${lib.fmt(bot.entity.position)}, HP=${bot.health.toFixed(1)}, Food=${bot.food}, Shield=${shield}, Blocks=${cobble}, DistToSpawner=${distToSpawner.toFixed(1)}m`);
console.log(`Inventory: ${invSummary}`);

bot.chat(`beta: At frontline (${lib.fmt(bot.entity.position)})! Shield: ${shield}, Building Blocks: ${cobble}, HP: ${bot.health.toFixed(1)}. Behind baffle wall, ready to breach Spawner!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  shield,
  cobble,
  distToSpawner,
  inv: lib.inv()
};
