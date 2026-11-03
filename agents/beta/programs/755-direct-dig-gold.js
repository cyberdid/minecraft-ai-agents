// programs/755-direct-dig-gold.js
console.log('=== Program 755: Direct Dig Gold & Craft Golden Boots ===');
console.log('Bot:', bot.username, 'Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Initial nuggets:', lib.count('gold_nugget'));

bot.clearControlStates();
bot.pathfinder.stop();

// Equip pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Target gold ore blocks within arm's reach (<= 4.0m)
const targets = [
  new Vec3(32, 69, -26),
  new Vec3(31, 69, -25),
  new Vec3(31, 69, -26),
  new Vec3(32, 69, -25)
];

for (const p of targets) {
  const b = bot.blockAt(p);
  console.log(`Checking block at ${lib.fmt(p)}: ${b?.name}`);
  if (b && b.name === 'nether_gold_ore') {
    console.log(`Digging nether_gold_ore at ${lib.fmt(p)}...`);
    try {
      await bot.lookAt(p.offset(0.5, 0.5, 0.5), true);
      await bot.dig(b);
      console.log(`Successfully mined gold at ${lib.fmt(p)}!`);
      await sleep(200);
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(p)}:`, e.message);
    }
  }
}

// Pickup drops
await lib.pickup(4.0);

const totalNuggets = lib.count('gold_nugget');
console.log(`Gold nuggets after mining: ${totalNuggets}`);
bot.chat(`Beta: Direct mined gold vein! Holding ${totalNuggets} gold nuggets!`);

// Convert nuggets to gold ingots in 2x2 grid
if (totalNuggets >= 9) {
  const ingotRecipe = bot.recipesFor(mcData.itemsByName.gold_ingot.id, null, 1, null)[0];
  if (ingotRecipe) {
    const numIngots = Math.floor(totalNuggets / 9);
    console.log(`Crafting ${numIngots} gold ingots...`);
    try {
      await bot.craft(ingotRecipe, numIngots, null);
      console.log('Ingots crafted! Ingot count:', lib.count('gold_ingot'));
      bot.chat(`Beta: Crafted ${lib.count('gold_ingot')} Gold Ingots!`);
    } catch (e) {
      console.log('Craft ingots error:', e.message);
    }
  }
}

// If we have 4+ gold ingots, walk back to Overworld base to craft golden_boots
if (lib.count('gold_ingot') >= 4) {
  console.log('Have 4+ gold ingots! Walking to Nether portal camp (40, 65, -7)...');
  try {
    await lib.goTo(40, 65, -7, 2, { timeoutMs: 12000 });
  } catch (e) {}

  const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
  if (portal) {
    console.log('Warping to Overworld base...');
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
    console.log('In Overworld! Walking to crafting table at (295, 72, -56)...');
    try {
      await lib.goTo(294, 72, -56, 1.5, { timeoutMs: 8000 });
    } catch (e) {}

    const table = bot.blockAt(new Vec3(295, 72, -56));
    if (table && table.name.includes('crafting_table')) {
      const bootsRecipe = bot.recipesFor(mcData.itemsByName.golden_boots.id, null, 1, table)[0];
      if (bootsRecipe) {
        console.log('Crafting golden_boots on crafting table...');
        try {
          await bot.craft(bootsRecipe, 1, table);
          console.log('Crafted golden_boots!');
          await bot.equip(mcData.itemsByName.golden_boots.id, 'feet');
          bot.chat('Beta: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% PIGLIN NEUTRALITY ACTIVE!');
        } catch (e) {
          console.log('Craft golden_boots error:', e.message);
        }
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
