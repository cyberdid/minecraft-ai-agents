// programs/756-craft-golden-boots.js
// Retrieve gold from chest, craft golden_boots, equip for 100% Piglin neutrality!
console.log('=== Program 756: Consolidate Gold & Craft Golden Boots ===');
console.log('Beta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);
console.log('Nuggets on Beta:', lib.count('gold_nugget'));

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: In Nether, walk to Nether Portal at (40, 65, -7)
if (bot.game.dimension === 'the_nether') {
  console.log('Walking to Nether portal at (40, 65, -7)...');
  const moves = new Movements(bot, mcData);
  moves.canDig = true;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);

  try {
    await bot.pathfinder.goto(new goals.GoalNear(40, 65, -7, 2));
  } catch (e) {
    try { await lib.goToXZ(40, -7, { timeoutMs: 12000 }); } catch (e2) {}
  }

  const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 10 });
  if (portal) {
    console.log('Stepping into Nether Portal...');
    await bot.lookAt(portal.position.offset(0.5, 0.5, 0.5), true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.setControlState('forward', false);

    const warpStart = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
      await sleep(300);
    }
  }
}

if (bot.game.dimension !== 'overworld') {
  throw new Error('Failed to warp to Overworld base');
}

console.log('In Overworld! Pos:', lib.fmt(bot.entity.position));

// Step 2: Walk to base chest at (293, 72, -57)
try {
  await lib.goTo(293.5, 72.0, -56.5, 1.0, { timeoutMs: 8000 });
} catch (e) {}

const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name.includes('chest')) {
  const chest = await bot.openChest(chestBlock);
  console.log('Base chest items:', chest.containerItems().map(i => `${i.name}x${i.count}`).join(', '));

  // Withdraw gold_ingot and gold_nugget from chest
  const chestIngot = chest.containerItems().find(i => i.name === 'gold_ingot');
  if (chestIngot) {
    await chest.withdraw(chestIngot.type, null, chestIngot.count);
    console.log(`Withdrew ${chestIngot.count} gold_ingot from chest!`);
  }
  const chestNuggets = chest.containerItems().find(i => i.name === 'gold_nugget');
  if (chestNuggets) {
    await chest.withdraw(chestNuggets.type, null, chestNuggets.count);
    console.log(`Withdrew ${chestNuggets.count} gold_nugget from chest!`);
  }
  await chest.close();
}

console.log('Gold in inventory: nuggets =', lib.count('gold_nugget'), ', ingots =', lib.count('gold_ingot'));

// Step 3: Convert nuggets into gold ingots
const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  const ingotRecipe = bot.recipesFor(mcData.itemsByName.gold_ingot.id, null, 1, null)[0];
  if (ingotRecipe) {
    const numIngots = Math.floor(nuggets / 9);
    console.log(`Crafting ${numIngots} gold ingots from ${nuggets} nuggets...`);
    try {
      await bot.craft(ingotRecipe, numIngots, null);
      console.log('Crafted ingots! Total ingots now:', lib.count('gold_ingot'));
    } catch (e) {
      console.log('Crafting ingots note:', e.message);
    }
  }
}

// Step 4: Craft and equip golden_boots at crafting table (295, 72, -56)
const totalIngots = lib.count('gold_ingot');
console.log('Total gold ingots available:', totalIngots);

if (totalIngots >= 4) {
  const table = bot.blockAt(new Vec3(295, 72, -56));
  console.log('Crafting table at (295, 72, -56):', table?.name);
  if (table && table.name.includes('crafting_table')) {
    const bootsRecipe = bot.recipesFor(mcData.itemsByName.golden_boots.id, null, 1, table)[0];
    if (bootsRecipe) {
      console.log('Crafting golden_boots...');
      try {
        await bot.craft(bootsRecipe, 1, table);
        console.log('Crafted golden_boots successfully!');
      } catch (e) {
        console.log('Craft boots error:', e.message);
      }
    }
  }

  // Equip golden boots
  const boots = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (boots) {
    console.log('Equipping golden_boots in feet armor slot...');
    await bot.equip(boots, 'feet');
    bot.chat('Beta: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% PIGLIN NEUTRALITY ACTIVE!');
    console.log('Feet slot (slot 8):', bot.inventory.slots[8]?.name);
  }
}

// Deposit spare items in chest
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const ss = bot.inventory.items().find(i => i.name === 'netherrack');
    if (ss && ss.count > 16) await chest.deposit(ss.type, null, ss.count - 16);
    await chest.close();
  } catch (e) {}
}

console.log('Final status: HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());
return {
  golden_boots_equipped: bot.inventory.slots[8]?.name === 'golden_boots',
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget'),
  hp: bot.health,
  dim: bot.game.dimension
};
