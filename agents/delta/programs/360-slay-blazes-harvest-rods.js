// programs/360-slay-blazes-harvest-rods.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Equip stone sword
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) {
  await bot.equip(sword, 'hand');
  console.log('Equipped stone sword!');
}

// 2. Check for shield in inventory and equip offhand
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield) {
  try {
    await bot.equip(shield, 'off-hand');
    console.log('Equipped shield in off-hand!');
  } catch (e) {}
}

// 3. Combat Loop: attack blazes, duck/retreat if low hp, vacuum up drops
const startTime = Date.now();
let rodsCount = lib.count('blaze_rod');
console.log(`Starting combat! Initial blaze_rods: ${rodsCount}`);

while (!isCancelled() && (Date.now() - startTime < 55000) && bot.health > 7) {
  // Always keep sword equipped
  const s = bot.inventory.items().find(i => i.name.includes('sword'));
  if (s && bot.entity.heldItem?.name !== s.name) {
    try { await bot.equip(s, 'hand'); } catch (e) {}
  }

  // Find nearest Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e && e.name === 'blaze' && e.position && bot.entity.position.distanceTo(e.position) <= 8.0)
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  if (blazes.length > 0) {
    const target = blazes[0];
    const dist = bot.entity.position.distanceTo(target.position);
    console.log(`Targeting Blaze at ${lib.fmt(target.position)} (dist ${dist.toFixed(1)}m, target HP: ${target.metadata?.[9] || '?'})...`);

    await bot.lookAt(target.position.offset(0, 1.2, 0), true);
    
    // If shield equipped, activate right click if blaze is charging or shooting
    if (dist <= 3.8) {
      await bot.attack(target);
      await sleep(550);
      await bot.attack(target);
    } else {
      // Approach cautiously
      await bot.lookAt(target.position, true);
      bot.setControlState('forward', true);
      await sleep(400);
      bot.setControlState('forward', false);
      await bot.attack(target);
    }
  } else {
    // If no blazes within 8m, look around or step towards spawner (32, 68, -190)
    console.log('No Blazes within 8m, scanning...');
    await sleep(400);
  }

  // Pick up any dropped Blaze Rods or gear within reach
  try {
    const p = await lib.pickup(6);
    if (p > 0) console.log(`Picked up ${p} item drops!`);
  } catch (e) {}

  const currentRods = lib.count('blaze_rod');
  if (currentRods !== rodsCount) {
    rodsCount = currentRods;
    console.log(`>>> BLAZE ROD HARVESTED! Total: ${rodsCount} <<<`);
    bot.chat(`delta: Harvested Blaze Rod! Total: ${rodsCount}/8! HP: ${bot.health}/20`);
  }

  await sleep(200);
}

// Final pickup
try {
  await lib.pickup(10);
} catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log(`Combat round complete! Blaze rods in inventory: ${finalRods}`);
console.log('Final inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

bot.chat(`delta: Spawner combat round complete! Blaze Rods: ${finalRods}, HP: ${bot.health}/20`);
