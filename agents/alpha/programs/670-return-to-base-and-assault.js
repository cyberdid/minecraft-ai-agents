// programs/670-return-to-base-and-assault.js
console.log('=== Program 670: Alpha Return to Base, Set Spawn, & Pillbox Assault ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;

// 1. If at world spawn or outside base in overworld, return to base
if (bot.game.dimension === 'overworld') {
  if (bot.entity.position.distanceTo(new Vec3(293, 72, -55)) > 5.0) {
    console.log('Walking back to base (293, 72, -55)...');
    try {
      await lib.goTo(294, 72, -52, 2, { timeoutMs: 25000 });
    } catch (e) {
      try { await lib.goToXZ(294, -52, { timeoutMs: 15000 }); } catch (e2) {}
    }
  }

  // If outside door, enter house
  if (bot.entity.position.z > -54.0) {
    console.log('Entering base door (294, 72, -54)...');
    try {
      await lib.goThroughDoor(294, 72, -54);
    } catch (e) {}
  }

  // Lock spawn at bed!
  console.log('Locking spawn at Bed...');
  try {
    await lib.setSpawn();
    console.log('Spawn point locked successfully!');
    bot.chat('alpha: Spawn point permanently set at Base Bed!');
  } catch (e) {
    console.log('setSpawn note:', e.message);
  }

  // Quick regear and offhand check
  await globalThis.quickRegear({ cobble: 16 });
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  const offhand = bot.inventory.slots[45];
  if (!offhand || offhand.name !== 'shield') {
    const shield = bot.inventory.items().find(i => i.name === 'shield');
    if (shield) await bot.equip(shield, 'off-hand');
  }
  console.log('Gear check: Offhand =', bot.inventory.slots[45]?.name, 'Held =', bot.heldItem?.name, 'Cobble =', lib.count('cobblestone'));

  // If night time, sleep in bed to skip night
  const t = bot.time.timeOfDay;
  if (t >= 12542 && t < 23460) {
    console.log('Night time! Sleeping in bed...');
    try {
      await lib.sleepInBed();
      console.log('Slept until dawn! Time:', bot.time.timeOfDay);
    } catch (e) {
      console.log('sleepInBed note:', e.message);
    }
  }
}

// 2. March to Spawner Pillbox (handles portal entry and all 19 waypoints)
console.log('Executing marchToSpawnerPillbox()...');
const marchRes = await globalThis.marchToSpawnerPillbox();
console.log('March complete:', marchRes);

// 3. Farm Blaze Rods
if (bot.game.dimension === 'the_nether' && bot.health > 7) {
  bot.chat(`alpha: Locked inside Spawner Pillbox (${lib.fmt(bot.entity.position)}) with Active Shield! Harvesting Blaze Rods!`);
  const farmRes = await globalThis.farmBlazeRodsAtPillbox(8, 150000);
  console.log('Farm results:', farmRes);

  const rods = lib.count('blaze_rod');
  bot.chat(`alpha: Combat session complete. Blaze Rods: ${rods}/8, HP: ${bot.health.toFixed(1)}`);

  if (rods >= 8) {
    bot.chat('alpha: 8+ Blaze Rods achieved! Milestone 8 COMPLETE! Retreating to Overworld Base.');
    await globalThis.retreatToOverworldBase();
    if (bot.game.dimension === 'overworld') {
      try {
        await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
        bot.chat('alpha: Deposited 8+ Blaze Rods in base chest! Milestone 8 100% COMPLETE!');
      } catch (e) {}
    }
  }
}

console.log('=== Program 670 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Rods:', lib.count('blaze_rod'));
