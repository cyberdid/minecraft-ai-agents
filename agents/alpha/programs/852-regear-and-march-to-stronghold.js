// programs/852-regear-and-march-to-stronghold.js
console.log('=== Program 852: Overworld Regear & March to Stronghold ===');
console.log('Starting state: dim=', bot.game.dimension, 'pos=', lib.fmt(bot.entity.position), 'HP=', bot.health, 'Food=', bot.food);

if (bot.game.dimension !== 'overworld') {
  console.log('Not in Overworld yet! Waiting...');
} else {
  bot.chat('alpha: Respawned in Overworld Base! Regearing for Stronghold expedition!');

  // 1. Equip armor, weapon, and check inventory
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // 2. Access Base Chest at (293, 72, -57) to grab any spare iron gear, food, or eyes
  const chestPos = new Vec3(293, 72, -57);
  const chestBlock = bot.blockAt(chestPos);
  if (chestBlock && chestBlock.name.includes('chest')) {
    try {
      console.log('Opening Base Chest at (293, 72, -57)...');
      const chest = await bot.openChest(chestBlock);
      console.log('Chest items:', chest.items().map(i => `${i.name}x${i.count}`).join(', '));
      
      // Withdraw food if needed
      const food = chest.items().find(i => ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'bread', 'baked_potato'].includes(i.name));
      if (food && lib.count(food.name) < 16) {
        await chest.withdraw(food.type, null, Math.min(food.count, 16 - lib.count(food.name)));
      }

      // Withdraw eyes of ender if any present in chest
      const eyes = chest.items().find(i => i.name === 'ender_eye');
      if (eyes) {
        await chest.withdraw(eyes.type, null, eyes.count);
        console.log(`Withdrew ${eyes.count} ender_eye from chest!`);
      }
      
      chest.close();
    } catch (e) {
      console.log('Chest error:', e.message);
    }
  }

  // 3. Quick regear check
  await globalThis.quickRegear({ cobble: 32 });
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  console.log('Regear complete. Current inventory:', lib.inv());

  // 4. March to Stronghold at (233, 70, -98)
  const strongholdTarget = new Vec3(233, 70, -98);
  console.log(`Marching to Stronghold coordinates at ${lib.fmt(strongholdTarget)}...`);
  bot.chat('alpha: Marching to Stronghold coordinates at (233, 70, -98)!');

  // Go out base door at (294, 72, -54)
  if (bot.entity.position.z < -54) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }

  // Pathfind to surface above Stronghold
  try {
    await bot.pathfinder.goto(new goals.GoalNear(233, 70, -98, 2.0));
  } catch (e) {
    console.log('Pathfinder error, trying goToXZ:', e.message);
    try {
      await lib.goToXZ(233, -98, { timeoutMs: 35000 });
    } catch (e2) {
      console.log('goToXZ error:', e2.message);
    }
  }

  console.log(`Arrived at Stronghold site: pos=${lib.fmt(bot.entity.position)}`);
  bot.chat(`alpha: Reached Stronghold surface at ${lib.fmt(bot.entity.position)}! Ready to excavate!`);
}
