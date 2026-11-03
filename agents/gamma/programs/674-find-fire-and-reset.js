// programs/674-find-fire-and-reset.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 674: FIND FIRE OR SOUL FIRE FOR CLEAN RESET ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

const fires = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire' || b.name === 'lava'),
  maxDistance: 32,
  count: 10
});

console.log(`Found ${fires.length} fire/soul_fire/lava hazard blocks within 32m:`);
for (const fp of fires) {
  const b = bot.blockAt(fp);
  console.log(`  ${b.name} at ${lib.fmt(fp)} (dist: ${bot.entity.position.distanceTo(fp).toFixed(1)}m)`);
}

if (fires.length > 0) {
  const targetFire = fires[0];
  console.log(`Stepping into ${bot.blockAt(targetFire)?.name} at ${lib.fmt(targetFire)} for instant Overworld base bed reset...`);
  bot.chat(`gamma: Tactical reset via fire to Overworld Base Bed (294, 72, -55) with 22 Blaze Powder!`);

  await bot.lookAt(targetFire.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(4000);
  bot.clearControlStates();

  // Wait for respawn
  const startWait = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - startWait < 15000 && !isCancelled()) {
    await sleep(250);
  }
} else {
  console.log('No fire within 32m.');
}

console.log('Post-reset status: Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Overworld arrival
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: United in Overworld Base! Depositing 16 Blaze Powder into Base Chest (293, 72, -57)...');

  // Move inside base if outside
  try {
    await lib.goTo(293, 72, -55, 1.2, { timeoutMs: 8000 });
  } catch (e) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
  }

  // Open Base Chest (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      console.log('Opening Base Chest (293, 72, -57)...');
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();

      // Check food
      const food = cItems.find(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
      if (food && bot.food < 18) {
        await chest.withdraw(food.type, null, Math.min(food.count, 6));
      }

      // Check iron armor
      for (const piece of ['iron_boots', 'iron_helmet', 'iron_chestplate', 'iron_leggings']) {
        const it = cItems.find(i => i.name === piece);
        if (it && lib.count(piece) === 0) {
          await chest.withdraw(it.type, null, 1);
        }
      }

      // Deposit 16 Blaze Powder for team
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

  // Craft Eyes of Ender if we have ingredients
  const bpCount = lib.count('blaze_powder');
  const epCount = lib.count('ender_pearl');
  if (bpCount > 0 && epCount > 0) {
    const toCraft = Math.min(bpCount, epCount);
    try {
      await lib.craft('eye_of_ender', toCraft);
      console.log(`CRAFTED! Total Eyes of Ender: ${lib.count('eye_of_ender')}`);
      bot.chat(`gamma: CRAFTED ${lib.count('eye_of_ender')} EYES OF ENDER! Stronghold expedition ready!`);
    } catch (err) {}
  }

  // Equip iron armor & weapons
  const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
  if (ib) try { await bot.equip(ib, 'feet'); } catch (e) {}
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_powder: lib.count('blaze_powder'),
  eyes: lib.count('eye_of_ender'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
