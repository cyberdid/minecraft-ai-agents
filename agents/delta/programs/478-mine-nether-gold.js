// programs/478-mine-nether-gold.js
globalThis.isProgramCancelled = isCancelled;
globalThis.isCancelled = isCancelled;

console.log('Delta logging in at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Equip gear
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

console.log('Held:', bot.heldItem?.name, 'Offhand:', bot.inventory.slots[45]?.name);

// 2. Configure Nether safety
if (bot.game.dimension === 'the_nether') {
  globalThis.configureFireAvoidance();
}

// 3. Check for nether_gold_ore
const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
console.log('nether_gold_ore block ID:', goldOreId);

let ores = [];
if (goldOreId) {
  ores = bot.findBlocks({
    matching: goldOreId,
    maxDistance: 32,
    count: 20
  });
}
console.log(`Found ${ores.length} nether_gold_ore blocks within 32m:`, ores.map(p => lib.fmt(p)).join(', '));

// 4. Mine reachable nether_gold_ore
let mined = 0;
for (const p of ores) {
  if (isCancelled()) break;
  // Safety: don't dig if suspended directly over lava
  const below = bot.blockAt(p.offset(0, -1, 0));
  if (below && below.name === 'lava') {
    console.log(`Skipping ore at ${lib.fmt(p)}: over lava!`);
    continue;
  }

  console.log(`Approaching nether_gold_ore at ${lib.fmt(p)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(p.x, p.y, p.z, 2.5));
    const targetBlock = bot.blockAt(p);
    if (targetBlock && targetBlock.name === 'nether_gold_ore') {
      await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
      console.log(`Mining nether_gold_ore at ${lib.fmt(p)}...`);
      await bot.dig(targetBlock);
      mined++;
      await sleep(200);
      try { await lib.pickup(3.5); } catch (e) {}
    }
  } catch (e) {
    console.log(`Mining at ${lib.fmt(p)} note:`, e.message);
  }

  if (lib.count('gold_nugget') >= 36) {
    console.log('Collected 36+ nuggets (enough for 4 ingots / golden_boots)!');
    break;
  }
}

// 5. Pickup nearby drops
try { await lib.pickup(4); } catch (e) {}

const nuggets = lib.count('gold_nugget');
console.log(`Gold nuggets in inv: ${nuggets}`);

// 6. Craft ingots if we have 9+ nuggets
if (nuggets >= 9) {
  const craftIngots = Math.floor(nuggets / 9);
  try {
    console.log(`Crafting ${craftIngots} gold_ingot...`);
    await lib.craft('gold_ingot', craftIngots);
    console.log('Crafted gold ingots! Total:', lib.count('gold_ingot'));
  } catch (e) {
    console.log('Craft ingot note:', e.message);
  }
}

// 7. Craft golden_boots if 4+ ingots
if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
  try {
    console.log('Crafting golden_boots...');
    await lib.craft('golden_boots', 1);
    console.log('Crafted golden_boots!');
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) {
      await bot.equip(gb, 'feet');
      console.log('Equipped golden_boots on feet!');
    }
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

// 8. Re-equip weapon & shield
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

bot.chat(`delta: Gold mining round done! Mined: ${mined} ores. Nuggets: ${lib.count('gold_nugget')}, Ingots: ${lib.count('gold_ingot')}, Golden Boots: ${lib.count('golden_boots')}.`);

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
