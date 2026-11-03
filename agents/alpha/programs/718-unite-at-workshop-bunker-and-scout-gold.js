// programs/718-unite-at-workshop-bunker-and-scout-gold.js
console.log('=== Program 718: Unite at Fortress Bunker & Scout Gold/Piglins ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain active offhand shield
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

bot.activateItem(true);
globalThis.configureFireAvoidance();

// 2. Walk 15m into Fortress Workshop Bunker at (44, 65, -128)
console.log('Walking into Fortress Workshop Bunker at (44, 65, -128)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(44.0, 65.0, -128.0, 1.2));
} catch (e) {
  try { await lib.goTo(44, 65, -128, 1.5, { timeoutMs: 6000 }); } catch (e2) {}
}

console.log('Inside Fortress Bunker at:', lib.fmt(bot.entity.position));

// 3. Check teammates at bunker
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (${dist}m), held: ${p.entity.heldItem?.name}`);
  }
}

// 4. Vacuum any drops on bunker floor
await lib.pickup(5.0);

// 5. Craft Crafting Table from oak_planks and place it if not present
const existingTable = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 8 });
console.log('Bunker crafting table:', existingTable ? lib.fmt(existingTable.position) : 'none');

if (!existingTable && lib.count('oak_planks') >= 4) {
  try {
    await lib.craft('crafting_table', 1);
    const tableSpot = new Vec3(44, 65, -129);
    const curBlock = bot.blockAt(tableSpot);
    if (curBlock && (curBlock.name === 'air' || curBlock.name === 'cave_air')) {
      await lib.place('crafting_table', tableSpot.x, tableSpot.y, tableSpot.z);
      console.log(`Placed Crafting Table inside bunker at ${lib.fmt(tableSpot)}!`);
      bot.chat('alpha: Placed Crafting Table inside Fortress Workshop Bunker (44, 65, -129)!');
    }
  } catch (e) {
    console.log('Crafting table note:', e.message);
  }
}

// 6. Scan for nether_gold_ore blocks around the bunker
const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
if (goldOreId) {
  const ores = bot.findBlocks({ matching: goldOreId, maxDistance: 24, count: 12 });
  console.log(`Found ${ores.length} nether_gold_ore blocks within 24m of bunker:`);
  for (const orePos of ores) {
    const dist = bot.entity.position.distanceTo(orePos).toFixed(1);
    console.log(` - gold ore at ${lib.fmt(orePos)} (${dist}m)`);
  }

  // Mine any safe ores within 6m
  const closeOres = ores.filter(p => bot.entity.position.distanceTo(p) <= 6.0 && p.y >= 63);
  for (const p of closeOres) {
    if (checkCancelled()) break;
    console.log(`Mining safe gold ore at ${lib.fmt(p)}...`);
    try {
      await bot.equip(mcData.itemsByName.iron_pickaxe.id, 'hand');
      await lib.dig(p.x, p.y, p.z);
      await sleep(200);
      await lib.pickup(3.5);
    } catch (err) {}
  }
}

// 7. Craft ingots if Alpha has 9+ nuggets
const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  try {
    const toCraft = Math.floor(nuggets / 9);
    await lib.craft('gold_ingot', toCraft);
    console.log(`Crafted ${toCraft} gold ingots! Total ingots: ${lib.count('gold_ingot')}`);
  } catch (e) {}
}

// 8. Scan for Piglins in range
const piglins = Object.values(bot.entities)
  .filter(e => e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 32);

console.log(`Piglins within 32m: ${piglins.length}`);
for (const pig of piglins) {
  console.log(` - Piglin at ${lib.fmt(pig.position)} (${bot.entity.position.distanceTo(pig.position).toFixed(1)}m)`);
}

// Check Endermen
const endermen = Object.values(bot.entities)
  .filter(e => e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 16);
console.log(`Endermen within 16m: ${endermen.length}`);

const pearls = lib.count('ender_pearl');
console.log(`=== Milestone 9 Status: Alpha holds ${pearls}/12 Ender Pearls ===`);
bot.chat(`alpha: United with Beta & Gamma inside Fortress Bunker (44, 65, -128)! Piglins detected: ${piglins.length}, Pearls: ${pearls}/12, HP: ${bot.health.toFixed(1)}/20`);

console.log('=== Program 718 Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());
