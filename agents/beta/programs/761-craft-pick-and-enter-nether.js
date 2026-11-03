// programs/761-craft-pick-and-enter-nether.js
console.log('=== Program 761: Craft Stone Pickaxe & Enter Nether ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Craft stone_pickaxe
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
  console.log('Crafting stone_pickaxe...');
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe crafted! Total pickaxes:', lib.count('*_pickaxe'));
  } catch (e) {
    console.log('Craft pickaxe note:', e.message);
  }
}

// Equip pickaxe & weapon & shield
try { await lib.equipWeapon(); } catch (e) {}
try { await lib.equipArmor(); } catch (e) {}

// Verify golden_boots
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
console.log('Feet armor slot:', bot.inventory.slots[8]?.name);

// Step 2: Enter Nether Portal at (299.5, 73, -54)
console.log('Entering Nether Portal to join Gamma in the Nether...');
bot.chat('Beta: Armed with stone pickaxe, shield & golden_boots! Entering Nether to mine gold & barter!');

const warpRes = await enterNetherPortal();
console.log('Warp result:', warpRes);

// Step 3: Verify Nether arrival
if (bot.game.dimension === 'the_nether') {
  console.log('SUCCESS: Beta is in the_nether at:', lib.fmt(bot.entity.position));
  configureFireAvoidance();
  bot.chat('Beta: In Nether Base Camp! 100% Piglin neutrality ACTIVE!');

  // Scan for nearby Nether Gold Ore blocks
  const goldOres = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 16,
    count: 10
  });
  console.log(`Found ${goldOres.length} nether_gold_ore blocks within 16m:`, goldOres.map(p => lib.fmt(p)).join(', '));

  // Scan for nearby Piglins
  const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin');
  console.log(`Found ${piglins.length} Piglins nearby.`);
}

console.log('=== Final Status ===');
console.log('Position:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  hp: bot.health,
  food: bot.food,
  pickaxes: lib.count('*_pickaxe'),
  swords: lib.count('*_sword')
};
