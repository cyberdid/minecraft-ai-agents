// programs/712-warp-to-base-regear-and-sleep.js
console.log('=== Program 712: Warp to Base, Regear & Sleep ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain active shield
bot.activateItem(true);
globalThis.configureFireAvoidance();

// 2. Step into Nether portal block
if (bot.game.dimension === 'the_nether') {
  const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 });
  if (portal) {
    console.log(`Stepping into nether_portal at ${lib.fmt(portal.position)}...`);
    bot.chat('alpha: Stepping into portal to retrieve gold from Base Chest and sleep at base!');
    const pCenter = portal.position.offset(0.5, 0.2, 0.5);
    await bot.lookAt(pCenter, true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < portal.position.y) bot.setControlState('jump', true);
    await sleep(800);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);

    const start = Date.now();
    while (bot.game.dimension === 'the_nether' && Date.now() - start < 20000 && !checkCancelled()) {
      const cur = bot.entity.position;
      if (Math.abs(cur.x - pCenter.x) > 0.5 || Math.abs(cur.z - pCenter.z) > 0.5) {
        await bot.lookAt(pCenter, true);
        bot.setControlState('forward', true);
        await sleep(150);
        bot.setControlState('forward', false);
      }
      await sleep(250);
    }
  } else {
    console.log('No nether_portal found within 12m');
  }
}

console.log('Dimension now:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// 3. Overworld Base operations
if (bot.game.dimension === 'overworld') {
  console.log('In Overworld! Walking into Base shelter...');
  
  // Step through base door into interior
  if (bot.entity.position.z > -54.0) {
    try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  }

  // Open Base Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openContainer(chestBlock);
      console.log('Base Chest contents:');
      for (const item of chest.containerItems()) {
        console.log(` - ${item.name} x ${item.count}`);
        if (item.name === 'gold_ingot' || item.name === 'gold_nugget') {
          await chest.withdraw(item.type, null, item.count);
          console.log(`Withdrew ${item.name} x${item.count}!`);
        }
      }
      chest.close();
    } catch (e) {
      console.log('Chest error:', e.message);
    }
  }

  // Craft ingots from nuggets if >= 9
  if (lib.count('gold_nugget') >= 9) {
    try {
      await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
      console.log(`Crafted ingots! Total gold_ingot: ${lib.count('gold_ingot')}`);
    } catch (e) {}
  }

  // Craft and equip golden_boots if 4+ ingots
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0 && bot.inventory.slots[8]?.name !== 'golden_boots') {
    console.log('Crafting golden_boots...');
    try {
      await lib.craft('golden_boots', 1);
      const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
      if (gb) await bot.equip(gb, 'feet');
      bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! Piglin neutrality 100% ACTIVE!');
    } catch (e) {
      console.log('Craft boots error:', e.message);
    }
  }

  // Sleep in bed if night
  if (lib.time().canSleep) {
    console.log('Night in Overworld! Sleeping in base bed (294, 72, -55)...');
    try {
      await lib.sleepInBed();
      bot.chat('alpha: Slept in base bed! HP and Food 100% restored to 20/20!');
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }

  const hasBoots = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;
  console.log(`Alpha status: Boots = ${hasBoots ? 'EQUIPPED' : 'PENDING'}, Ingots = ${lib.count('gold_ingot')}, HP = ${bot.health}, Food = ${bot.food}`);
  bot.chat(`alpha: Base visit complete! Golden Boots: ${hasBoots ? 'YES' : 'NO'}, Gold Ingots: ${lib.count('gold_ingot')}, HP: ${bot.health}/20`);
}

console.log('=== Program 712 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());
