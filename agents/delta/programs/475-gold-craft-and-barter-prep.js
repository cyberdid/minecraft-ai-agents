// programs/475-gold-craft-and-barter-prep.js
console.log('Delta checking Base Chest for Gold at:', lib.fmt(bot.entity.position));

const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
let chestItems = [];
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    chestItems = chest.containerItems();
    console.log('Base Chest items:', chestItems.map(i => `${i.name} x${i.count}`).join(', '));

    // Check total gold in chest
    const nuggets = chestItems.find(i => i.name === 'gold_nugget');
    const ingots = chestItems.find(i => i.name === 'gold_ingot');
    console.log(`Chest gold: ${ingots?.count || 0} ingots, ${nuggets?.count || 0} nuggets`);

    // If we have enough for golden_boots (4 ingots = 36 nuggets)
    const totalNuggetsInChest = (ingots?.count || 0) * 9 + (nuggets?.count || 0);
    console.log(`Total gold equivalent: ${totalNuggetsInChest} nuggets (need 36 for golden_boots)`);

    if (totalNuggetsInChest >= 36) {
      if (ingots) await chest.withdraw(ingots.type, null, ingots.count);
      if (nuggets) await chest.withdraw(nuggets.type, null, nuggets.count);
      console.log('Withdrew gold from chest!');
    }
    chest.close();
  } catch (e) {
    console.log('Chest interaction error:', e.message);
  }
}

// Check player inventory gold
const invNuggets = lib.count('gold_nugget');
const invIngots = lib.count('gold_ingot');
console.log(`Player inventory gold: ${invIngots} ingots, ${invNuggets} nuggets`);

// Craft ingots from nuggets if needed
if (invNuggets >= 9) {
  const craftableIngots = Math.floor(invNuggets / 9);
  try {
    console.log(`Crafting ${craftableIngots} gold_ingot...`);
    await lib.craft('gold_ingot', craftableIngots);
    console.log('Crafted gold ingots! Total:', lib.count('gold_ingot'));
  } catch (e) {
    console.log('Craft ingot error:', e.message);
  }
}

// Craft golden_boots if 4+ ingots
if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
  try {
    console.log('Crafting golden_boots...');
    await lib.craft('golden_boots', 1);
    console.log('Crafted golden_boots!');
  } catch (e) {
    console.log('Craft golden_boots error:', e.message);
  }
}

// Equip golden_boots if we have them
const gBoots = bot.inventory.items().find(i => i.name === 'golden_boots');
if (gBoots) {
  try {
    await bot.equip(gBoots, 'feet');
    console.log('Equipped golden_boots on feet!');
    bot.chat('delta: Equipped golden_boots! 100% immune to Piglins for Milestone 9 bartering!');
  } catch (e) {}
}

// Equip offhand shield and best weapon
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const armor = [5,6,7,8].map(s => bot.inventory.slots[s]?.name);
console.log('Armor worn:', armor);
console.log('Offhand:', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name);

bot.chat(`delta: Base gold check complete. Golden boots: ${lib.count('golden_boots')}, Gold ingots: ${lib.count('gold_ingot')}. Team advancing on Milestone 9!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv(),
  armor,
  held: bot.heldItem?.name,
  offhand: bot.inventory.slots[45]?.name
};
