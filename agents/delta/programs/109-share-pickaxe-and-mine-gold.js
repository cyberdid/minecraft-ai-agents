// programs/109-share-pickaxe-and-mine-gold.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Put 1 wooden_pickaxe into bunker chest for Beta
const chestPos = new Vec3(39, 65, -8);
try {
  if (lib.count('wooden_pickaxe') > 1) {
    console.log('Depositing 1 wooden_pickaxe in bunker chest for Beta...');
    await lib.deposit({ wooden_pickaxe: 1 }, chestPos.x, chestPos.y, chestPos.z);
    bot.chat('delta: Deposited spare pickaxe in bunker chest for Beta!');
  }
} catch (e) {
  console.log('Chest deposit note:', e.message);
}

// 2. Scan for nether_gold_ore nearby
const goldOres = bot.findBlocks({
  matching: b => b.name === 'nether_gold_ore',
  maxDistance: 20,
  count: 10
});
console.log(`Found ${goldOres.length} nether_gold_ore blocks nearby!`);

// Mine gold ores safely
let minedOres = 0;
for (const p of goldOres) {
  if (lib.count('gold_nugget') >= 36) break;
  console.log(`Mining nether_gold_ore at ${lib.fmt(p)}...`);
  try {
    await lib.dig(p.x, p.y, p.z);
    await sleep(200);
    await lib.pickup(4);
    minedOres++;
    console.log(`Mined gold ore! Gold nuggets in inv: ${lib.count('gold_nugget')}`);
  } catch (err) {
    console.log(`Dig error at ${lib.fmt(p)}:`, err.message);
  }
}

console.log('Total gold nuggets collected:', lib.count('gold_nugget'));

// 3. Craft gold nuggets into gold ingots (9 nuggets -> 1 ingot, 2x2 grid works)
if (lib.count('gold_nugget') >= 9) {
  const craftableIngots = Math.floor(lib.count('gold_nugget') / 9);
  console.log(`Crafting ${craftableIngots} gold ingots...`);
  try {
    await lib.craft('gold_ingot', craftableIngots);
    console.log(`Gold ingots in inv: ${lib.count('gold_ingot')}`);
  } catch (e) {
    console.log('Craft ingot note:', e.message);
  }
}

// 4. If gold ingots >= 4, craft golden_boots (at bunker table)
const tablePos = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 8, count: 1 })[0];
if (tablePos && lib.count('gold_ingot') >= 4 && !lib.count('golden_boots')) {
  console.log('Crafting golden_boots for Piglin pacification...');
  const tableBlock = bot.blockAt(tablePos);
  const gbItem = mcData.itemsByName.golden_boots;
  const rec = bot.recipesFor(gbItem.id, null, 1, tableBlock)[0];
  if (rec) {
    await bot.craft(rec, 1, tableBlock);
    await sleep(250);
    await lib.stowCursor();
    console.log('Crafted golden_boots successfully!');
  }
}

// Equip armor
await lib.equipArmor();
await lib.equipWeapon();

console.log('Equipped gear:', JSON.stringify(lib.tools()));
console.log('Delta inventory:', JSON.stringify(lib.inv()));

bot.chat(`delta: Gold status: nuggets=${lib.count('gold_nugget')}, ingots=${lib.count('gold_ingot')}, boots=${lib.count('golden_boots')}. Gear: ${JSON.stringify(lib.tools())}.`);
