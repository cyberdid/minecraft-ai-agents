// programs/626-inspect-corridor-and-march-spawner.js
console.log('=== Program 626: Inspect Corridor & March Spawner ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// 1. Inspect blocks ahead from z=-145 to z=-152
const currentPos = bot.entity.position.floored();
console.log('Inspecting path north along x=44, y=65..66...');
for (let z = currentPos.z - 1; z >= currentPos.z - 6; z--) {
  const floor = bot.blockAt(new Vec3(44, 64, z));
  const feet = bot.blockAt(new Vec3(44, 65, z));
  const head = bot.blockAt(new Vec3(44, 66, z));
  console.log(`z=${z} -> floor(y=64): ${floor?.name}, feet(y=65): ${feet?.name}, head(y=66): ${head?.name}`);
  
  // If feet or head is solid, dig it out so we can walk through!
  if (feet && feet.name !== 'air' && feet.boundingBox === 'block') {
    console.log(`Digging feet obstacle at (44, 65, ${z}): ${feet.name}...`);
    try { await bot.dig(feet); } catch (e) { console.log('Dig error:', e.message); }
  }
  if (head && head.name !== 'air' && head.boundingBox === 'block') {
    console.log(`Digging head obstacle at (44, 66, ${z}): ${head.name}...`);
    try { await bot.dig(head); } catch (e) { console.log('Dig error:', e.message); }
  }
}

// 2. March remaining waypoints to Spawner Balcony Pillbox
const remainingWaypoints = [
  new Vec3(44, 65, -150),
  new Vec3(44, 65, -163),
  new Vec3(44, 65, -174),
  new Vec3(37, 65, -177),
  new Vec3(36, 67, -185)
];

for (let i = 0; i < remainingWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = remainingWaypoints[i];
  if (bot.entity.position.distanceTo(wp) < 2.5) continue;
  
  console.log(`Advancing to WP ${i + 1}/${remainingWaypoints.length}: ${lib.fmt(wp)} (from ${lib.fmt(bot.entity.position)})`);
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: true, timeoutMs: 12000 });
  } catch (err) {
    console.log(`lib.goTo to ${lib.fmt(wp)} failed: ${err.message}. Manual sprint step...`);
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1500);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
  }
}

// 3. Arrived at Pillbox: Lock position!
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();
console.log('Arrived at Spawner Balcony Pillbox! Pos:', lib.fmt(bot.entity.position));

// 4. Vacuum dropped gear at pillbox
console.log('Vacuuming dropped stockpile at pillbox...');
try {
  const gained = await lib.pickup(4);
  console.log(`Vacuumed ${gained} items! Current inv:`, lib.inv());
} catch (e) {}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Offhand:', bot.inventory.slots[45]?.name, 'Mainhand:', bot.heldItem?.name);
bot.chat(`alpha: Pillbox locked! Offhand: ${bot.inventory.slots[45]?.name || 'none'}, Weapon: ${bot.heldItem?.name || 'none'}, Rods: ${lib.count('blaze_rod')}/8`);

// 5. Stationary Blaze combat loop
const combatStart = Date.now();
let lastRods = lib.count('blaze_rod');
let lastAttack = 0;

while (!isCancelled() && Date.now() - combatStart < 45000) {
  if (bot.health < 6) {
    console.log(`Health low (${bot.health.toFixed(1)}/20)! Retreating under roof (37, 65, -177)...`);
    try { await lib.goTo(37, 65, -177, 1, { timeoutMs: 3000 }); } catch (e) {}
    break;
  }
  
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && e.health > 0)
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  
  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    if (dist <= 4.8 && Date.now() - lastAttack > 600) {
      await bot.lookAt(target.position.offset(0, target.height * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
    }
  }
  
  if (Math.random() < 0.25) {
    try { await lib.pickup(3); } catch (e) {}
  }
  
  const currentRods = lib.count('blaze_rod');
  if (currentRods !== lastRods) {
    bot.chat(`alpha: Blaze Rod harvested! Total rods: ${currentRods}/8!`);
    lastRods = currentRods;
  }
  
  if (currentRods >= 7) {
    bot.chat(`alpha: TARGET ACHIEVED! ${currentRods} Blaze Rods harvested! Milestone 8 Complete!`);
    break;
  }
  
  await sleep(150);
}

try { await lib.pickup(4); } catch (e) {}
const finalRods = lib.count('blaze_rod');
console.log('Finished! Blaze Rods:', finalRods, 'HP:', bot.health.toFixed(1));
bot.chat(`alpha: Pillbox engagement complete! Rods: ${finalRods}/8, HP: ${bot.health.toFixed(1)}/20`);
