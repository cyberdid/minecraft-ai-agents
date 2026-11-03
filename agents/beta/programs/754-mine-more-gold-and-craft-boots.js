// programs/754-mine-more-gold-and-craft-boots.js
console.log('=== Program 754: Mine Gold to 36+ Nuggets & Craft Golden Boots ===');
console.log('Beta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);
console.log('Current nuggets:', lib.count('gold_nugget'));

bot.clearControlStates();
bot.pathfinder.stop();

// Scan for nearest nether_gold_ore
const ores = bot.findBlocks({
  matching: b => b && b.name === 'nether_gold_ore',
  maxDistance: 16,
  count: 10
});
console.log(`Found ${ores.length} nether gold ore blocks within 16m:`);
for (const p of ores) {
  console.log(` - Gold ore at ${lib.fmt(p)}, dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m`);
}

// Mine reachable gold ore until at least 36 nuggets
for (const p of ores) {
  if (lib.count('gold_nugget') >= 36) break;
  console.log(`Approaching and mining gold ore at ${lib.fmt(p)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(p.x, p.y, p.z, 2.5));
    const b = bot.blockAt(p);
    if (b && b.name === 'nether_gold_ore') {
      await bot.dig(b);
      await sleep(250);
      await lib.pickup(3.5);
    }
  } catch (e) {
    console.log(`Mining note at ${lib.fmt(p)}:`, e.message);
  }
}

await lib.pickup(4.0);

const totalNuggets = lib.count('gold_nugget');
console.log(`Gold nuggets in inventory now: ${totalNuggets}`);
bot.chat(`Beta: Mined Nether Gold Ore! Total gold nuggets: ${totalNuggets} (${Math.floor(totalNuggets/9)} ingots)`);

// Craft gold ingots from nuggets
if (totalNuggets >= 9) {
  const ingotRecipe = bot.recipesFor(mcData.itemsByName.gold_ingot.id, null, 1, null)[0];
  if (ingotRecipe) {
    const numIngots = Math.floor(totalNuggets / 9);
    console.log(`Crafting ${numIngots} gold ingots...`);
    try {
      await bot.craft(ingotRecipe, numIngots, null);
      console.log('Crafted gold ingots! Ingot count:', lib.count('gold_ingot'));
    } catch (e) {
      console.log('Crafting ingots note:', e.message);
    }
  }
}

// Check crafting table near Nether Base Camp (40, 65, -7)
if (lib.count('gold_ingot') >= 4) {
  console.log('Heading to Nether Portal camp to craft golden_boots...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(40, 65, -7, 3));
  } catch (e) {}

  let table = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 12 });
  if (!table) {
    // If no table in nether, warp to Overworld base where crafting table is confirmed at (295, 72, -56)
    console.log('No crafting table in Nether camp, warping to Overworld base...');
    const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
    if (portal) {
      await bot.lookAt(portal.position.offset(0.5, 0.5, 0.5), true);
      bot.setControlState('forward', true);
      await sleep(1500);
      bot.setControlState('forward', false);
      const warpStart = Date.now();
      while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
        await sleep(300);
      }
    }
    if (bot.game.dimension === 'overworld') {
      table = bot.blockAt(new Vec3(295, 72, -56));
    }
  }

  if (table) {
    const bootsRecipe = bot.recipesFor(mcData.itemsByName.golden_boots.id, null, 1, table)[0];
    if (bootsRecipe) {
      console.log('Crafting golden_boots...');
      try {
        await bot.craft(bootsRecipe, 1, table);
        console.log('Crafted golden_boots! Equipping...');
        await bot.equip(mcData.itemsByName.golden_boots.id, 'feet');
        bot.chat('Beta: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% PIGLIN NEUTRALITY ACTIVE!');
      } catch (e) {
        console.log('Boots craft note:', e.message);
      }
    }
  }
}

console.log('Final inventory:', lib.inv());
return {
  gold_nuggets: lib.count('gold_nugget'),
  gold_ingots: lib.count('gold_ingot'),
  has_golden_boots: lib.count('golden_boots') > 0 || bot.inventory.slots[8]?.name === 'golden_boots',
  hp: bot.health,
  food: bot.food,
  dim: bot.game.dimension
};
