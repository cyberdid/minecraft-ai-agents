// programs/687-warp-to-base-and-craft.js
console.log('=== Program 687: Warp to Base & Craft Golden Boots ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Warp to Overworld
if (bot.game.dimension === 'the_nether') {
  const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
  if (portalBlock) {
    console.log('Nether portal found at', portalBlock.position);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(portalBlock.position.x, portalBlock.position.y, portalBlock.position.z, 0.8));
    } catch (e) {}
    
    await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);

    const warpStart = Date.now();
    console.log('Standing in portal, waiting for warp to Overworld...');
    while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !checkCancelled()) {
      await sleep(300);
    }
  } else {
    console.log('No portal block within 16 blocks!');
  }
}

console.log('Now in dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// 2. In Overworld: step into base house (293, 72, -55)
if (bot.game.dimension === 'overworld') {
  if (bot.entity.position.distanceTo(new Vec3(293, 72, -55)) > 3.0) {
    try { await lib.goTo(294, 72, -52, 2, { timeoutMs: 12000 }); } catch (e) {}
  }
  if (bot.entity.position.z > -54.0) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }

  // Open Base Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const ing = chest.containerItems().find(i => i.name === 'gold_ingot');
      const nug = chest.containerItems().find(i => i.name === 'gold_nugget');
      if (ing) await chest.withdraw(ing.type, null, ing.count);
      if (nug) await chest.withdraw(nug.type, null, nug.count);
      await chest.close();
    } catch (e) {
      console.log('Chest error:', e.message);
    }
  }

  console.log('Gold in inventory: ingots =', lib.count('gold_ingot'), 'nuggets =', lib.count('gold_nugget'));

  // Craft ingots from nuggets
  if (lib.count('gold_nugget') >= 9) {
    const craftable = Math.floor(lib.count('gold_nugget') / 9);
    console.log(`Crafting ${craftable} gold ingots...`);
    try {
      await lib.craft('gold_ingot', craftable);
      console.log('Total ingots now:', lib.count('gold_ingot'));
    } catch (e) {
      console.log('Craft ingot note:', e.message);
    }
  }

  // Craft golden_boots if 4+ ingots
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    console.log('Crafting golden_boots...');
    try {
      await lib.craft('golden_boots', 1);
      console.log('Crafted golden_boots!');
      await lib.equipArmor();
      bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! Piglins are 100% neutral! Ready for Ender Pearl bartering!');
    } catch (e) {
      console.log('Craft boots note:', e.message);
    }
  } else {
    bot.chat(`alpha: Gold inventory: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets. Need ${4 - lib.count('gold_ingot')} more ingots for golden_boots.`);
  }

  // Sleep if night time
  const t = bot.time.timeOfDay;
  if (t >= 12542 && t < 23460) {
    try { await lib.sleepInBed(); } catch (e) {}
  }
}

console.log('=== Program 687 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'Armor:', bot.inventory.slots.slice(5, 9).map(s => s?.name), 'Inv:', lib.inv());
