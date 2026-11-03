// programs/693-fire-reset-or-portal.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 693: FIRE RESET / PORTAL RETURN TO BASE ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);

if (bot.game.dimension === 'the_nether') {
  bot.chat('gamma: Returning to Overworld Base with 22 Blaze Powder!');

  // Look at soul fire at (46, 64, 5) or (45, 64, 4)
  const firePos = new Vec3(46.0, 64.0, 5.0);
  console.log('Stepping directly into soul fire at:', lib.fmt(firePos));
  await bot.lookAt(firePos, true);
  bot.setControlState('forward', true);

  const startFire = Date.now();
  while (bot.game.dimension === 'the_nether' && Date.now() - startFire < 8000 && !isCancelled()) {
    if (bot.entity.position.distanceTo(firePos) > 0.3) {
      await bot.lookAt(firePos, true);
      bot.setControlState('forward', true);
    } else {
      bot.clearControlStates();
    }
    await sleep(200);
  }
  bot.clearControlStates();

  // Wait for respawn / dimension change
  console.log('Waiting for dimension === overworld...');
  const waitOverworld = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - waitOverworld < 15000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Dimension after routine:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// Overworld Base Operations
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: In Overworld Base! 22 Blaze Powder secured! HP: ' + bot.health + ', Food: ' + bot.food);
  console.log('=== OVERWORLD BASE SUCCESS ===');
  console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
  console.log('Inventory:', lib.inv());

  await sleep(1000);
  bot.clearControlStates();

  // If warped via portal at (299.5, 73, -54), step into house
  if (bot.entity.position.distanceTo(new Vec3(293.5, 72.0, -56.0)) > 2.5) {
    try {
      await lib.goToXZ(294, -53, { timeoutMs: 8000 });
      await lib.goThroughDoor(294, 72, -54);
    } catch (e) {
      console.log('Door info:', e.message);
    }
  }

  // Equip best armor and weapons
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}

  // Open Base Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      console.log('Opening Base Chest (293, 72, -57)...');
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();
      console.log('Chest items:', cItems.map(i => `${i.name}x${i.count}`).join(', '));

      // Deposit 10 Blaze Powder so teammates have powder
      const bp = bot.inventory.items().find(i => i.name === 'blaze_powder');
      if (bp && bp.count > 10) {
        console.log('Depositing 10 Blaze Powder into chest...');
        await chest.deposit(bp.type, null, 10);
        bot.chat('gamma: Deposited 10 Blaze Powder in Base Chest for Beta/Alpha!');
      }

      // Check for ender_pearls in chest
      const ep = cItems.find(i => i.name === 'ender_pearl');
      if (ep) {
        console.log(`Withdrawing ${ep.count} ender_pearls from chest...`);
        await chest.withdraw(ep.type, null, ep.count);
      }

      // Withdraw food if needed
      const food = cItems.find(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
      if (food && bot.food < 18) {
        await chest.withdraw(food.type, null, Math.min(food.count, 8));
      }

      chest.close();
    } catch (ce) {
      console.log('Chest error:', ce.message);
    }
  }

  // Craft Eyes of Ender if we have ingredients
  const bpCount = lib.count('blaze_powder');
  const epCount = lib.count('ender_pearl');
  console.log(`Crafting check: blaze_powder=${bpCount}, ender_pearl=${epCount}`);
  if (bpCount > 0 && epCount > 0) {
    const toCraft = Math.min(bpCount, epCount);
    try {
      await lib.craft('eye_of_ender', toCraft);
      bot.chat(`gamma: CRAFTED ${toCraft} EYES OF ENDER! Total in inv: ${lib.count('eye_of_ender')}`);
    } catch (err) {
      console.log('Craft eye_of_ender err:', err.message);
    }
  }

  // Ensure shield is in offhand
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}

console.log('=== END PROGRAM 693 ===');
console.log('Final Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  eyes: lib.count('eye_of_ender'),
  blaze_powder: lib.count('blaze_powder'),
  inv: lib.inv()
};
