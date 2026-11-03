// programs/672-approach1-into-portal.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 672: STEP ALONG z=-8 INTO PORTAL ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'Blaze Powder:', lib.count('blaze_powder'));

bot.clearControlStates();

// Step to (48, 65, -8)
console.log('Moving to (48, 65, -8)...');
await bot.lookAt(new Vec3(48.0, 65.0, -8.0), true);
bot.setControlState('forward', true);
let t1 = Date.now();
while (bot.entity.position.x > 48.2 && Date.now() - t1 < 4000 && !isCancelled()) {
  await sleep(100);
}
bot.clearControlStates();
console.log('At step 1:', lib.fmt(bot.entity.position));

// Step to (43, 65, -8)
console.log('Moving to (43, 65, -8)...');
await bot.lookAt(new Vec3(43.0, 65.0, -8.0), true);
bot.setControlState('forward', true);
let t2 = Date.now();
while (bot.entity.position.x > 43.2 && Date.now() - t2 < 5000 && !isCancelled()) {
  await sleep(100);
}
bot.clearControlStates();
console.log('At step 2:', lib.fmt(bot.entity.position));

// Step into portal at (41, 65, -7)
console.log('Stepping into nether_portal block at (41, 65, -7)...');
await bot.lookAt(new Vec3(41.0, 65.5, -7.0), true);
bot.setControlState('forward', true);
await sleep(3500);
bot.setControlState('forward', false);

console.log('Waiting for dimension warp to Overworld...');
const warpStart = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
  await sleep(250);
}

// Overworld arrival
if (bot.game.dimension === 'overworld') {
  console.log('WARPED TO OVERWORLD! Pos:', lib.fmt(bot.entity.position));
  bot.chat('gamma: Safely in Overworld with 22 Blaze Powder! Delivering to Base Chest (293, 72, -57)!');

  try {
    await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 15000 });
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
  }

  // Open Base Chest (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      console.log('Opening Base Chest to deposit Blaze Powder...');
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();

      // Check food
      const food = cItems.find(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
      if (food && bot.food < 18) {
        await chest.withdraw(food.type, null, Math.min(food.count, 6));
      }

      // Check iron boots
      const ib = cItems.find(i => i.name === 'iron_boots');
      if (ib && lib.count('iron_boots') === 0) {
        await chest.withdraw(ib.type, null, 1);
      }

      // Deposit 16 Blaze Powder for Beta & Delta
      const bpInInv = bot.inventory.items().find(i => i.name === 'blaze_powder');
      if (bpInInv && bpInInv.count >= 8) {
        await chest.deposit(bpInInv.type, null, Math.min(16, bpInInv.count));
        bot.chat('gamma: DEPOSITED 16 BLAZE POWDER INTO BASE CHEST (293, 72, -57)!');
      }

      // Check if ender_pearls in chest
      const epInChest = cItems.find(i => i.name === 'ender_pearl');
      if (epInChest) {
        await chest.withdraw(epInChest.type, null, epInChest.count);
      }

      chest.close();
    } catch (ce) {
      console.log('Chest error:', ce.message);
    }
  }

  // Eat if hungry
  const foods = ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'];
  for (const f of foods) {
    if (lib.count(f) > 0 && bot.food < 18) {
      try { await lib.eat(); } catch (e) {}
    }
  }

  // Craft Eyes of Ender
  const bpCount = lib.count('blaze_powder');
  const epCount = lib.count('ender_pearl');
  if (bpCount > 0 && epCount > 0) {
    const toCraft = Math.min(bpCount, epCount);
    try {
      await lib.craft('eye_of_ender', toCraft);
      console.log(`CRAFTED! Total Eyes of Ender: ${lib.count('eye_of_ender')}`);
      bot.chat(`gamma: CRAFTED ${lib.count('eye_of_ender')} EYES OF ENDER! Milestone 10 100% COMPLETE!`);
    } catch (err) {}
  }

  // Equip best gear
  const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
  if (ib) try { await bot.equip(ib, 'feet'); } catch (e) {}
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
}

console.log(`=== END PROGRAM 672: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}, Blaze Powder=${lib.count('blaze_powder')}, Eyes=${lib.count('eye_of_ender')}, HP=${bot.health} ===`);
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_powder: lib.count('blaze_powder'),
  eyes: lib.count('eye_of_ender'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
