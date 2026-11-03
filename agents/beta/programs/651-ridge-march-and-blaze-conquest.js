// programs/651-ridge-march-and-blaze-conquest.js
console.log('=== Program 651: East Ridge March & Blaze Conquest ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

bot.chat('beta: Advancing down East Ridge covered trail to Spawner Pillbox!');

// Configure movement with strict fire and lava avoidance
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowSprinting = true;
bot.pathfinder.setMovements(moves);

const waypoints = [
  { name: 'Ridge 1', pos: new Vec3(63, 66, -20) },
  { name: 'Ridge 2', pos: new Vec3(62, 66, -35) },
  { name: 'Ridge 3', pos: new Vec3(62, 67, -50) },
  { name: 'Ridge 4', pos: new Vec3(61, 67, -65) },
  { name: 'Ridge 5', pos: new Vec3(62, 67, -80) },
  { name: 'Ridge 6', pos: new Vec3(61, 66, -100) },
  { name: 'Fortress Turn', pos: new Vec3(50, 65, -115) },
  { name: 'Fortress Outpost', pos: new Vec3(44, 65, -127) },
  { name: 'Tunnel 1', pos: new Vec3(44, 65, -145) },
  { name: 'Tunnel 2', pos: new Vec3(44, 65, -160) },
  { name: 'Tunnel 3', pos: new Vec3(44, 65, -169) },
  { name: 'Bridge Cross', pos: new Vec3(44, 65, -176) },
  { name: 'Turn North', pos: new Vec3(38, 65, -176) },
  { name: 'Walkway Mid', pos: new Vec3(38, 65, -178) },
  { name: 'Deck Approach', pos: new Vec3(37, 65, -184) },
  { name: 'Deck Ramp', pos: new Vec3(35, 67, -186) },
  { name: 'Spawner Pillbox', pos: new Vec3(34, 68, -188) }
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`[WP ${i+1}/${waypoints.length}] Moving to ${wp.name} at ${wp.pos}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.pos.x, wp.pos.y, wp.pos.z, 1.8));
    console.log(`Arrived near ${wp.name}: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`Path error at ${wp.name}:`, e.message);
    // If pathfinder gave up, try direct walk if within 5m
    const d = bot.entity.position.distanceTo(wp.pos);
    if (d < 6) {
      try {
        await bot.lookAt(wp.pos, true);
        bot.setControlState('forward', true);
        await sleep(1000);
        bot.clearControlStates();
      } catch (e2) {}
    }
  }
}

console.log('--- At Spawner Balcony Front --- Pos:', lib.fmt(bot.entity.position));

// Safety block placements to prevent falling into the pit and knockback
if (lib.count('cobblestone') > 0) {
  const pit = bot.blockAt(new Vec3(33, 66, -187));
  if (!pit || pit.name === 'air') {
    console.log('Sealing pit at (33, 66, -187)...');
    try { await lib.place('cobblestone', 33, 66, -187); } catch (e) {}
  }
  const wall1 = bot.blockAt(new Vec3(34, 68, -187));
  if (!wall1 || wall1.name === 'air') {
    console.log('Sealing back wall at (34, 68, -187)...');
    try { await lib.place('cobblestone', 34, 68, -187); } catch (e) {}
  }
  const wall2 = bot.blockAt(new Vec3(35, 68, -187));
  if (!wall2 || wall2.name === 'air') {
    console.log('Sealing back wall at (35, 68, -187)...');
    try { await lib.place('cobblestone', 35, 68, -187); } catch (e) {}
  }
}

// Vacuum all dropped items on the deck
console.log('Vacuuming dropped items...');
await lib.pickup(10);
await lib.equipArmor();
await lib.equipWeapon();
console.log('Equipped gear! Held:', bot.inventory.selectedItem?.name, 'Inv:', JSON.stringify(lib.inv()));
console.log('Blaze rods currently carried:', lib.count('blaze_rod'));

bot.chat(`beta: In Spawner Pillbox! Carried Blaze rods: ${lib.count('blaze_rod')}`);

// Combat loop: Slay Blazes through protected slit
let rounds = 0;
while (rounds < 100 && !isCancelled()) {
  rounds++;
  const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) <= 4.2);
  if (blaze) {
    const dist = bot.entity.position.distanceTo(blaze.position).toFixed(1);
    console.log(`[Round ${rounds}] Striking Blaze at dist ${dist}m...`);
    await lib.equipWeapon();
    await bot.lookAt(blaze.position.offset(0, 0.5, 0), true);
    bot.attack(blaze);
    await sleep(600);
  } else {
    // If shield equipped in off-hand, hold shield active
    if (bot.inventory.slots[45]?.name === 'shield') {
      try { bot.activateItem(true); } catch (e) {}
    }
    await sleep(300);
  }

  if (rounds % 3 === 0) {
    const gained = await lib.pickup(6);
    if (gained > 0) {
      console.log('Drops scooped! Blaze rods:', lib.count('blaze_rod'), 'Inv:', JSON.stringify(lib.inv()));
    }
  }

  if (lib.count('blaze_rod') >= 7) {
    console.log('====================================');
    console.log('MILESTONE 8 COMPLETE! 7+ BLAZE RODS!');
    console.log('====================================');
    bot.chat(`beta: MILESTONE 8 COMPLETE! Harvested ${lib.count('blaze_rod')} Blaze Rods from Spawner!`);
    break;
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
