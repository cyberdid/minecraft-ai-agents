// programs/634-craft-golden-boots-for-alpha.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 634: CRAFT GOLDEN BOOTS FOR ALPHA & TEAM SYNC ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Maintain golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// 2. Scan for Alpha and other teammates
let players = Object.values(bot.entities).filter(e => e.type === 'player' && e !== bot.entity);
console.log(`Players tracked (${players.length}):`);
for (const p of players) {
  console.log(`- ${p.username} at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

// 3. Move to bunker Crafting Table at (44, 65, -134)
const ctPos = new Vec3(44, 65, -134);
const ctBlock = bot.blockAt(ctPos);
console.log('Block at (44, 65, -134):', ctBlock ? ctBlock.name : 'null');

// Find crafting table within 8m
let tableBlock = bot.findBlock({
  matching: b => b && b.name === 'crafting_table',
  maxDistance: 8
});

if (!tableBlock) {
  // If no crafting table block, check if we have planks to craft & place one
  console.log('No crafting table within 8m. Checking inventory for planks...');
  const oakPlanks = lib.count('oak_planks');
  const birchPlanks = lib.count('birch_planks');
  if (oakPlanks + birchPlanks >= 4) {
    console.log('Crafting crafting_table in 2x2 grid...');
    await lib.craft('crafting_table', 1);
    await lib.place(44, 65, -134, 'crafting_table');
    tableBlock = bot.blockAt(ctPos);
  }
}

// 4. Craft golden_boots if we have >= 4 gold_ingot and don't already have spare boots
const spareBoots = bot.inventory.items().filter(i => i.name === 'golden_boots').length;
console.log(`Gold ingots: ${lib.count('gold_ingot')}, Spare golden boots in inventory: ${spareBoots}`);

if (lib.count('gold_ingot') >= 4 && spareBoots <= 1) {
  console.log('Crafting golden_boots for Alpha at crafting table...');
  try {
    await lib.craft('golden_boots', 1);
    console.log('Crafted golden_boots successfully!');
    bot.chat('gamma: Crafted golden_boots for Alpha at bunker crafting table (44, 65, -134)!');
  } catch (err) {
    console.log('Crafting error:', err.message);
  }
}

// Ensure Gamma still has golden boots equipped on feet!
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}

// 5. Check if Alpha is at the bunker to receive golden_boots
players = Object.values(bot.entities).filter(e => e.type === 'player' && e !== bot.entity);
const alpha = players.find(p => p.username === 'alpha');

if (alpha) {
  const distToAlpha = bot.entity.position.distanceTo(alpha.position);
  console.log(`Alpha is at ${lib.fmt(alpha.position)}, distance: ${distToAlpha.toFixed(1)}m`);
  
  // Find spare golden_boots (not equipped in slot 8)
  const extraBoots = bot.inventory.items().find(i => i.name === 'golden_boots' && i.slot !== 8);
  if (extraBoots && distToAlpha <= 6.0) {
    console.log('Tossing extra golden_boots to Alpha...');
    await bot.lookAt(alpha.position.offset(0, 1.0, 0), true);
    await bot.tossStack(extraBoots);
    bot.chat('gamma: alpha: Here are golden_boots! Equip them on feet for 100% Piglin neutrality!');
    await sleep(1000);
  }
} else {
  console.log('Alpha has not yet entered tracking range at the bunker.');
}

// 6. Scan nearby Piglins and Endermen
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 32
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Piglins within 32m: ${piglins.length}`);
for (const p of piglins) {
  const dy = Math.abs(p.position.y - bot.entity.position.y);
  console.log(`- Piglin at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m, dY: ${dy.toFixed(1)}m`);
}

// 7. Check ground items and vacuum
const groundItems = Object.values(bot.entities).filter(e =>
  e.name === 'item' && e.isValid && bot.entity.position.distanceTo(e.position) <= 8
);
if (groundItems.length > 0) {
  await lib.pickup(6.0);
}

// 8. Report final inventory and pearls
console.log('=== END PROGRAM 634 ===');
console.log('Inventory:', lib.inv());
console.log(`Ender Pearls: ${lib.count('ender_pearl')}/12, Gold Ingots: ${lib.count('gold_ingot')}`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: lib.count('ender_pearl'),
  ingots: lib.count('gold_ingot'),
  inv: lib.inv()
};
