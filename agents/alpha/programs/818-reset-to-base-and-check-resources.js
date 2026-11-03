// programs/818-reset-to-base-and-check-resources.js
console.log('=== Program 818: Reset to Base & Resource Check ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. If low HP in Nether, step into lava to trigger immediate respawn with keepInventory
if (bot.game.dimension === 'the_nether' && bot.health <= 4) {
  bot.chat('alpha: Respawning cleanly to restore 20/20 HP and Food for Stage 3 Piglin bartering!');
  
  // Find adjacent lava
  const lava = bot.findBlock({
    matching: b => b && b.name.includes('lava'),
    maxDistance: 6
  });

  if (lava) {
    console.log('Stepping into lava at:', lib.fmt(lava.position));
    await bot.lookAt(lava.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.clearControlStates();
  } else {
    // If no lava found, jump/pillar
    bot.chat('/kill'); // or fall
  }

  // Wait for respawn
  const deathWait = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - deathWait < 15000 && !checkCancelled()) {
    await sleep(250);
  }
}

// 2. Wait until in Overworld
const respawnWait = Date.now();
while (bot.game.dimension !== 'overworld' && Date.now() - respawnWait < 15000 && !checkCancelled()) {
  await sleep(250);
}

await sleep(600);
console.log('Post-respawn: dim =', bot.game.dimension, 'pos =', lib.fmt(bot.entity.position), 'HP =', bot.health, 'Food =', bot.food);

if (bot.game.dimension === 'overworld') {
  bot.chat('alpha: 20/20 HP & Food restored! Checking Base Chest for gold, armor & food...');

  // Inspect Chest at (293, 72, -57)
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  let chestItems = [];
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      chestItems = chest.items().map(it => ({ name: it.name, count: it.count, slot: it.slot }));
      console.log('Base Chest items:', JSON.stringify(chestItems));

      // Withdraw any armor, gold, cooked food
      for (const item of chest.items()) {
        if (item.name.includes('helmet') || item.name.includes('chestplate') ||
            item.name.includes('leggings') || item.name.includes('boots') ||
            item.name.includes('shield') || item.name.includes('gold') ||
            item.name.includes('cooked') || item.name.includes('bread') ||
            item.name === 'ender_pearl') {
          console.log(`Withdrawing ${item.count}x ${item.name} from chest...`);
          try { await chest.withdraw(item.type, null, item.count); } catch (err) {}
        }
      }
      chest.close();
    } catch (e) {
      console.log('Chest open error:', e.message);
    }
  }

  // Inspect Furnaces at (295, 72, -54), (295, 72, -55), (295, 72, -56)
  for (const fPos of [new Vec3(295, 72, -54), new Vec3(295, 72, -55), new Vec3(295, 72, -56)]) {
    const fb = bot.blockAt(fPos);
    if (fb && fb.name.includes('furnace')) {
      try {
        const furnace = await bot.openFurnace(fb);
        const out = furnace.outputItem();
        if (out) {
          console.log(`Furnace at ${lib.fmt(fPos)} has output: ${out.count}x ${out.name}`);
          await furnace.takeOutput();
        }
        furnace.close();
      } catch (e) {
        console.log(`Furnace error at ${lib.fmt(fPos)}:`, e.message);
      }
    }
  }

  // Check inventory after withdrawals
  console.log('Inventory after loot check:', JSON.stringify(lib.inv()));

  // Craft golden_boots if we have >= 4 gold ingots and don't have golden boots
  let goldIngots = lib.count('gold_ingot');
  let goldNuggets = lib.count('gold_nugget');
  let rawGold = lib.count('raw_gold');

  // Convert nuggets to ingots if >= 9
  if (goldNuggets >= 9) {
    try { await lib.craft('gold_ingot', Math.floor(goldNuggets / 9)); } catch (e) {}
  }

  // Check if we have golden boots
  const hasGoldenBoots = bot.inventory.items().some(i => i.name === 'golden_boots') ||
    bot.inventory.slots[8]?.name === 'golden_boots';

  if (!hasGoldenBoots && lib.count('gold_ingot') >= 4) {
    console.log('Crafting golden_boots for Piglin neutrality...');
    try {
      await lib.craft('golden_boots', 1);
      bot.chat('alpha: Crafted golden_boots for 100% Piglin neutrality!');
    } catch (e) {
      console.log('Failed to craft golden boots:', e.message);
    }
  }

  // Equip golden boots if available
  const boots = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (boots) {
    try {
      await bot.equip(boots, 'feet');
      console.log('Equipped golden_boots on feet!');
    } catch (e) {}
  }

  // Equip remaining armor (helmet, chestplate, leggings, shield)
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  armor: bot.inventory.slots.slice(5, 9).map(i => i ? i.name : 'empty'),
  gold_ingots: lib.count('gold_ingot'),
  ender_pearls: lib.count('ender_pearl'),
  blaze_powder: lib.count('blaze_powder'),
  inv: lib.inv()
};
