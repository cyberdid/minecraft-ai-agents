// programs/476-mine-nether-gold.js
globalThis.isProgramCancelled = isCancelled;
globalThis.isCancelled = isCancelled;

console.log('Delta starting Nether Gold Expedition at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Enter Nether portal if in Overworld
if (bot.game.dimension === 'overworld') {
  // Exit base through door
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}

  console.log('Entering Nether Portal (299.5, 73, -54)...');
  await enterNetherPortal(30000);
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether: currently in ${bot.game.dimension}`);
}

console.log('Delta arrived in the_nether at:', lib.fmt(bot.entity.position));
bot.chat('delta: In the Nether to mine Nether Gold Ore for Milestone 9 (12+ Ender Pearls)!');

// Configure movements and fire avoidance
globalThis.configureFireAvoidance();
try { await lib.equipArmor(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

// 2. Search for nether_gold_ore blocks near the portal camp (40, 65, -7)
const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
if (!goldOreId) throw new Error('nether_gold_ore not found in mcData');

const ores = bot.findBlocks({
  matching: goldOreId,
  maxDistance: 32,
  count: 20
});

console.log(`Found ${ores.length} nether_gold_ore blocks near portal camp.`);

const startNuggets = lib.count('gold_nugget');
let mined = 0;

for (const orePos of ores) {
  if (isCancelled()) break;
  // Safety check: ensure ore is not hanging over open lava
  const below = bot.blockAt(orePos.offset(0, -1, 0));
  if (below && below.name === 'lava') {
    console.log(`Skipping ore at ${lib.fmt(orePos)}: over lava!`);
    continue;
  }

  console.log(`Approaching nether_gold_ore at ${lib.fmt(orePos)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.5));
    const targetBlock = bot.blockAt(orePos);
    if (targetBlock && targetBlock.name === 'nether_gold_ore') {
      await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
      console.log(`Mining nether_gold_ore at ${lib.fmt(orePos)}...`);
      await bot.dig(targetBlock);
      mined++;
      await sleep(200);
      try { await lib.pickup(3.5); } catch (e) {}
    }
  } catch (e) {
    console.log('Ore mining note:', e.message);
  }

  // If we collected 36+ nuggets, that is enough for golden_boots!
  if (lib.count('gold_nugget') >= 36) {
    console.log('Collected 36+ gold nuggets!');
    break;
  }
}

const finalNuggets = lib.count('gold_nugget');
console.log(`Mining session finished. Mined ${mined} ores. Nuggets: ${startNuggets} -> ${finalNuggets}`);
bot.chat(`delta: Gold mining round complete! Mined ${mined} nether_gold_ore. Nuggets held: ${finalNuggets}.`);

// Craft ingots if we have 9+ nuggets
if (finalNuggets >= 9) {
  const ingotsToCraft = Math.floor(finalNuggets / 9);
  try {
    await lib.craft('gold_ingot', ingotsToCraft);
    console.log(`Crafted ${ingotsToCraft} gold_ingot! Total ingots: ${lib.count('gold_ingot')}`);
    bot.chat(`delta: Crafted ${ingotsToCraft} gold ingots! Total ingots: ${lib.count('gold_ingot')}.`);
  } catch (e) {
    console.log('Craft ingot note:', e.message);
  }
}

// Craft golden_boots if 4+ ingots
if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
  try {
    await lib.craft('golden_boots', 1);
    console.log('Crafted golden_boots!');
    bot.chat('delta: Crafted golden_boots for Piglin neutrality!');
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) await bot.equip(gb, 'feet');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  mined,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  boots: lib.count('golden_boots'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
