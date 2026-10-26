// programs/597-advance-to-frontline-and-fortify.js
console.log('=== Step: Mine Netherrack & Advance Safely to Frontline ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

if (!bot.game.dimension.includes('nether')) {
  console.log('Not in Nether! Aborting.');
  return;
}

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Mine 30 netherrack with wooden pickaxe
console.log('Mining 30 netherrack blocks...');
if (lib.count('wooden_pickaxe') > 0) {
  await bot.equip(mcData.itemsByName.wooden_pickaxe.id, 'hand');
}
let mined = 0;
while (lib.count('netherrack') < 30 && mined < 36 && !isCancelled()) {
  const nr = bot.findBlock({
    matching: mcData.blocksByName.netherrack.id,
    maxDistance: 4,
    useExtraInfo: (b) => b.position.y >= 64 && b.position.y <= 66
  });
  if (!nr) break;
  try {
    await bot.dig(nr);
    mined++;
    await sleep(50);
  } catch (e) {
    break;
  }
}
await lib.pickup(4);
console.log(`Netherrack mined: ${lib.count('netherrack')}, Inv:`, JSON.stringify(lib.inv()));

// 2. Configure pathfinder to strictly avoid all fire & lava
if (typeof configureFireAvoidance === 'function') {
  configureFireAvoidance();
} else {
  const moves = new Movements(bot, mcData);
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  moves.canDig = false;
  bot.pathfinder.setMovements(moves);
}

// 3. Safe waypoints bypassing soul fire (Delta's route: z <= -8)
const waypoints = [
  new Vec3(46, 65, -8),
  new Vec3(52, 65, -8),
  new Vec3(63, 64, -8),
  new Vec3(63, 66, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127), // Fortress Workshop Outpost
  new Vec3(44, 65, -140), // Covered corridor
  new Vec3(44, 65, -160), // Baffle wall
  new Vec3(44, 65, -174)  // West blast wall end (SAFE STOP)
];

console.log('Starting march along safe waypoints...');
for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    console.log(`WP ${i + 1} pathfinder note:`, e.message);
    bot.lookAt(wp, true);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.clearControlStates();
  }

  // Pick up any dropped items along the way
  const picked = await lib.pickup(6);
  if (picked > 0) {
    console.log(`Picked up items at WP ${i + 1}! Checking armor/weapons...`);
    try { await lib.equipArmor(); } catch (e) {}
    try { await lib.equipWeapon(); } catch (e) {}
  }
}

console.log('Reached safe frontline staging point at:', lib.fmt(bot.entity.position));
console.log('Inventory:', JSON.stringify(lib.inv()));
bot.chat(`beta: At safe frontline staging point (${lib.fmt(bot.entity.position)}) with ${lib.count('netherrack')} netherrack and ${lib.count('cobblestone')} cobble!`);

return {
  pos: bot.entity.position,
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
