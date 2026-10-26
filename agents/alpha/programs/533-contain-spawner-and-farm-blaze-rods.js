// programs/533-contain-spawner-and-farm-blaze-rods.js
console.log('=== Program 533: Contain Spawner & Farm Blaze Rods ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Cobble:', lib.count('cobblestone'));

bot.pathfinder.stop();
await sleep(100);

await lib.equipWeapon();

// 1. Check surrounding blocks to step up to balcony y=67
console.log('Building step up to balcony...');
try {
  // Check if step at (36, 65, -185) exists
  const step1 = bot.blockAt(new Vec3(36, 65, -185));
  if (!step1 || step1.name === 'air') {
    await lib.place('cobblestone', 36, 65, -185);
  }
  const step2 = bot.blockAt(new Vec3(36, 66, -185));
  if (!step2 || step2.name === 'air') {
    await lib.place('cobblestone', 36, 66, -185);
  }
} catch (e) {
  console.log('Step placement note:', e.message);
}

// 2. Step up onto balcony platform at (34.5, 68.0, -188.5)
console.log('Stepping onto Spawner Balcony platform...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(34.5, 68.0, -188.5, 1));
} catch (e) {
  console.log('Goto balcony note:', e.message);
  await bot.lookAt(new Vec3(34.5, 68.0, -188.5), true);
  bot.setControlState('jump', true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
}

console.log('Balcony position reached:', lib.fmt(bot.entity.position));

// 3. Build a 2-high protective battlements shield between bot and spawner (32, 68, -190)
// Leave a 1-block strike slit at eye height to hit Blazes safely!
console.log('Building battlements slit...');
try {
  // Lower barrier at y=68
  await lib.place('cobblestone', 33, 68, -189);
  await lib.place('cobblestone', 33, 68, -190);
  // Upper roof cover at y=70 to block overhead fireballs
  await lib.place('cobblestone', 34, 70, -189);
} catch (e) {
  console.log('Battlements note:', e.message);
}

// 4. Attack any Blazes in range through the slit!
console.log('Scanning for Blazes to slay...');
for (let round = 0; round < 10; round++) {
  if (isCancelled()) break;
  
  // Find nearest Blaze
  const blazes = Object.values(bot.entities)
    .filter(e => e && e.name === 'blaze' && e.isValid)
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  
  if (blazes.length > 0) {
    const target = blazes[0];
    const d = bot.entity.position.distanceTo(target.position);
    console.log(`Targeting Blaze at ${lib.fmt(target.position)} (dist ${d.toFixed(1)}m, HP ~${target.metadata?.[9] || '?'})...`);
    if (d <= 4.5) {
      await bot.lookAt(target.position.offset(0, target.height * 0.5, 0), true);
      bot.attack(target);
      await sleep(600); // weapon cooldown
    }
  } else {
    console.log('No Blazes currently in sight, waiting for spawner...');
    await sleep(1500);
  }

  // Pick up any dropped Blaze Rods!
  await lib.pickup(5);
  if (lib.count('blaze_rod') > 0) {
    console.log(`SUCCESS! Blaze Rods in inventory: ${lib.count('blaze_rod')}!`);
    bot.chat(`alpha: BLAZE ROD HARVESTED! Have ${lib.count('blaze_rod')} Blaze Rods! Milestone 8 underway!`);
    break;
  }
}

// 5. Final report
console.log('=== Assault Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);
console.log('Blaze Rods:', lib.count('blaze_rod'));
console.log('Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
