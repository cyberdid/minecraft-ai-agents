// programs/623-reclaim-weapons-shield-and-farm-blazes.js
console.log('=== Program 623: Reclaim Sword, Shield & Farm Blaze Rods ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Move 2m forward to (34, 67, -188) to scoop stone sword
console.log('Moving to (34, 67, -188) to scoop stone sword...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(34, 67, -188, 0.8));
} catch (e) {
  console.log('Move note:', e.message);
}
await lib.pickup(4);
await lib.equipWeapon();
console.log('Inv after step 1:', JSON.stringify(lib.inv()));

// 2. Clear immediate hostiles if any within 3.5m (e.g. wither skeleton or close blaze)
const closeEnemy = bot.nearestEntity(e => ['wither_skeleton', 'blaze'].includes(e.name) && bot.entity.position.distanceTo(e.position) < 3.8);
if (closeEnemy) {
  console.log(`Defending against close ${closeEnemy.name} at dist ${bot.entity.position.distanceTo(closeEnemy.position).toFixed(1)}m...`);
  await lib.equipWeapon();
  for (let h = 0; h < 4; h++) {
    await bot.lookAt(closeEnemy.position.offset(0, 1.0, 0), true);
    bot.attack(closeEnemy);
    await sleep(650);
  }
}

// 3. Move forward towards (32, 68, -190) to scoop shield and 33 cobblestone
console.log('Moving towards (32, 68, -190) to scoop shield & cobblestone...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(32, 68, -190, 1.2));
} catch (e) {
  console.log('Move note 2:', e.message);
}
await lib.pickup(6);
console.log('Inv after step 3:', JSON.stringify(lib.inv()));

// Equip armor & shield!
await lib.equipArmor();
await lib.equipWeapon();
console.log('Equipped gear! Held:', bot.inventory.selectedItem?.name);

// 4. Place cobblestone battlement wall at head level if we have cobblestone
if (lib.count('cobblestone') >= 2) {
  console.log('Placing head-level protective battlement at (32, 69, -189)...');
  try { await lib.place('cobblestone', 32, 69, -189); } catch (e) {}
  try { await lib.place('cobblestone', 33, 69, -189); } catch (e) {}
}

// 5. Farm Blazes & Harvest 7+ Blaze Rods!
console.log('=== Farming Blazes for 7+ Blaze Rods ===');
let rounds = 0;
while (rounds < 60 && !isCancelled()) {
  rounds++;
  const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 5.5);
  if (blaze) {
    console.log(`[Round ${rounds}] Slaying Blaze at dist ${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m...`);
    await lib.equipWeapon();
    await bot.lookAt(blaze.position.offset(0, 0.5, 0), true);
    bot.attack(blaze);
    await sleep(650);
  } else {
    await sleep(400);
  }

  const gained = await lib.pickup(6);
  if (gained > 0) {
    console.log('Drops scooped! Current Blaze Rods:', lib.count('blaze_rod'));
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
