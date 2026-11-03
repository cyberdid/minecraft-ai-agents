// programs/721-return-base-regear-and-check-chest.js
console.log('=== Program 721: Return to Base, Set Spawn, Inspect Chest & Regear ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Walk from spawn to base door at (294, 72, -54)
console.log('Walking to base...');
try {
  await lib.goToXZ(294, -53, { timeoutMs: 15000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1.5)); } catch (e2) {}
}

console.log('Near base door at:', lib.fmt(bot.entity.position));

// 2. Enter base through door at (294, 72, -54)
if (bot.entity.position.z > -54.2) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    try {
      await lib.door(294, 72, -54, true);
      await bot.pathfinder.goto(new goals.GoalNear(294, 72, -55.5, 0.5));
      await lib.door(294, 72, -54, false);
    } catch (e2) {}
  }
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Set spawn at bed (294, 72, -55)
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
  bot.chat('alpha: Spawn point set at base bed (294, 72, -55)!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 4. Inspect Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
let chestItems = [];
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    chestItems = chest.containerItems().map(i => ({ name: i.name, count: i.count }));
    console.log('Base Chest contents:');
    for (const item of chestItems) {
      console.log(` - ${item.name} x ${item.count}`);
    }

    // Withdraw useful items: gold ingots, gold nuggets, iron ingots, shield, armor, cooked food
    for (const item of chest.containerItems()) {
      if (
        item.name.includes('gold_') ||
        item.name.includes('iron_') ||
        item.name.includes('diamond_') ||
        item.name === 'shield' ||
        item.name === 'ender_pearl' ||
        item.name === 'blaze_powder' ||
        item.name.includes('cooked_') ||
        item.name === 'bread' ||
        item.name === 'apple'
      ) {
        // Leave blaze_powder in chest unless crafting Eyes of Ender
        if (item.name === 'blaze_powder') continue;
        console.log(`Withdrawing ${item.name} x${item.count}...`);
        try {
          await chest.withdraw(item.type, null, item.count);
        } catch (we) {}
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest interaction error:', e.message);
  }
}

// 5. Inspect Furnaces at (295, 72, -54..-56)
for (const fz of [-54, -55, -56]) {
  const fPos = new Vec3(295, 72, fz);
  const fb = bot.blockAt(fPos);
  if (fb && fb.name === 'furnace') {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fPos)}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      if (f.outputItem()) {
        await f.takeOutput();
      }
      f.close();
    } catch (fe) {}
  }
}

// 6. Check inventory, craft ingots from nuggets, craft golden_boots if possible
console.log('Alpha inventory after withdrawal:', lib.inv());
const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  try {
    const toCraft = Math.floor(nuggets / 9);
    await lib.craft('gold_ingot', toCraft);
    console.log(`Crafted ${toCraft} gold ingots from nuggets!`);
  } catch (e) {}
}

const ingots = lib.count('gold_ingot');
console.log(`Total gold ingots: ${ingots}`);

// Check boots
const hasGoldenBoots = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;
if (ingots >= 4 && !hasGoldenBoots) {
  try {
    console.log('Crafting golden_boots...');
    await lib.craft('golden_boots', 1);
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) await bot.equip(gb, 'feet');
    bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! 100% Piglin neutrality active!');
  } catch (e) {
    console.log('Craft boots error:', e.message);
  }
}

// Equip armor & shield & weapon
try { await lib.equipArmor(); } catch (e) {}
try {
  // If we have golden_boots, make sure slot 8 has golden_boots
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb && bot.inventory.slots[8]?.name !== 'golden_boots') {
    await bot.equip(gb, 'feet');
  }
} catch (e) {}

try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

try { await lib.equipWeapon(); } catch (e) {}

// Check gear
console.log('Armor worn:', {
  head: bot.inventory.slots[5]?.name,
  torso: bot.inventory.slots[6]?.name,
  legs: bot.inventory.slots[7]?.name,
  feet: bot.inventory.slots[8]?.name,
  offhand: bot.inventory.slots[45]?.name,
  held: bot.heldItem?.name
});

bot.chat(`alpha: Regeared at base! HP: ${bot.health.toFixed(1)}/20, Food: ${bot.food}/20, Boots: ${bot.inventory.slots[8]?.name || 'none'}, Gold Ingots: ${lib.count('gold_ingot')}`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv(),
  chest: chestItems
};
