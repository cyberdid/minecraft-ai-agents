// programs/523-retreat-to-base-and-check-chest.js
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('=== DELTA: RETREAT TO BASE & REGEAR ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, dim: ${bot.game.dimension}, HP: ${bot.health}`);

// Call retreat helper
const res = await retreatToOverworldBase();
console.log('retreatToOverworldBase result:', JSON.stringify(res));

if (bot.game.dimension === 'overworld') {
  // Enter base door if outside
  if (bot.entity.position.z > -54.0) {
    console.log('Entering base house via door (294, 72, -54)...');
    try {
      await lib.goThroughDoor(294, 72, -54);
    } catch (e) {
      console.log('goThroughDoor error:', e.message);
    }
  }

  // Go to chest at (293, 72, -57)
  console.log('Approaching base chest at (293, 72, -57)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1.2));
  } catch (e) {
    console.log('goto chest error:', e.message);
  }

  // Inspect chest
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  let chestItems = [];
  if (chestBlock && chestBlock.name.includes('chest')) {
    const chest = await bot.openChest(chestBlock);
    chestItems = chest.containerItems().map(i => ({ name: i.name, count: i.count }));
    console.log('--- BASE CHEST CONTENTS ---');
    console.log(JSON.stringify(chestItems));

    // Withdraw food if needed and present
    const foodItem = chest.containerItems().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'].includes(i.name));
    if (foodItem && bot.food < 18) {
      console.log(`Withdrawing food: ${foodItem.name} x${Math.min(foodItem.count, 8)}`);
      await chest.withdraw(foodItem.type, null, Math.min(foodItem.count, 8));
    }

    // Withdraw armor / shield if present and missing
    for (const piece of ['iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots', 'shield', 'golden_boots', 'golden_helmet']) {
      const it = chest.containerItems().find(i => i.name === piece);
      if (it && lib.count(piece) === 0) {
        console.log(`Withdrawing gear: ${it.name}`);
        await chest.withdraw(it.type, null, 1);
      }
    }

    // Check for Ender Pearls / Blaze Powder / Blaze Rods
    const pearls = chest.containerItems().find(i => i.name === 'ender_pearl');
    const powder = chest.containerItems().find(i => i.name === 'blaze_powder');
    const rods = chest.containerItems().find(i => i.name === 'blaze_rod');
    const gold = chest.containerItems().find(i => i.name === 'gold_ingot');
    console.log(`Chest summary: Pearls=${pearls ? pearls.count : 0}, BlazePowder=${powder ? powder.count : 0}, BlazeRods=${rods ? rods.count : 0}, GoldIngots=${gold ? gold.count : 0}`);

    chest.close();
  } else {
    console.log('No chest block at (293, 72, -57)! Block is:', chestBlock ? chestBlock.name : 'null');
  }

  // Eat food if available
  try {
    if (bot.food < 20) {
      const edible = bot.inventory.items().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'].includes(i.name));
      if (edible) {
        console.log(`Eating ${edible.name}...`);
        await bot.equip(edible, 'hand');
        await bot.consume();
      }
    }
  } catch (e) {
    console.log('Eat error:', e.message);
  }

  // Regear
  console.log('Running quickRegear...');
  await quickRegear({ cobble: 16 });

  // Equip shield if in inventory
  try {
    const shield = bot.inventory.items().find(i => i.name === 'shield');
    if (shield) await bot.equip(shield, 'off-hand');
  } catch (e) {}

  bot.chat(`delta: Back at base! HP: ${bot.health}, Food: ${bot.food}. Gear updated.`);
}

console.log('=== PROGRAM FINISHED ===');
console.log(`Final pos: ${lib.fmt(bot.entity.position)}, Dim: ${bot.game.dimension}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
