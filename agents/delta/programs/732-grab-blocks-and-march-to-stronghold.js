// programs/732-grab-blocks-and-march-to-stronghold.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 732: GEAR UP & MARCH TO STRONGHOLD ===');
console.log('Delta start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Time:', bot.time.timeOfDay);

// 1. Grab 64 netherrack from Base Chest (293, 72, -57)
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb && lib.count('netherrack') < 32 && lib.count('cobblestone') < 32) {
  try {
    const chest = await bot.openChest(cb);
    const nr = chest.containerItems().find(i => i.name === 'netherrack');
    if (nr) {
      console.log(`Withdrawing ${nr.count} netherrack for construction...`);
      await chest.withdraw(nr.type, null, Math.min(nr.count, 64));
    }
    chest.close();
  } catch (e) {
    console.log('Chest withdraw err:', e.message);
  }
}

// 2. Equip gear
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield) {
  try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}

// 3. Exit Base House through door (294, 72, -54)
console.log('Exiting Base House through door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door passage note:', e.message);
}

bot.chat('delta: Marching from Base (293, 72, -55) to Stronghold site (233, 70, -98)!');

// 4. March to Stronghold coordinates (233, 70, -98)
const strongholdSurface = new Vec3(233.0, 70.0, -98.0);
console.log(`Marching to Stronghold site at ${lib.fmt(strongholdSurface)} (~74m)...`);

const waypoints = [
  new Vec3(280.0, 71.0, -65.0),
  new Vec3(255.0, 70.0, -80.0),
  strongholdSurface
];

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`Advancing to Waypoint ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (err) {
    console.log(`Pathfinder to WP ${i + 1} err:`, err.message);
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 12000 });
    } catch (e2) {}
  }
  console.log(`Current pos: ${lib.fmt(bot.entity.position)}`);
}

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

const dist = bot.entity.position.distanceTo(strongholdSurface);
console.log(`Arrived near Stronghold site! Distance: ${dist.toFixed(1)}m. Pos: ${lib.fmt(bot.entity.position)}`);

// Check nearby players
for (const p of Object.values(bot.entities).filter(e => e.type === 'player')) {
  console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

return {
  pos: bot.entity.position,
  distToStronghold: dist,
  inv: lib.inv(),
  hp: bot.health,
  food: bot.food
};
