// programs/694-mine-ridge-gold-and-craft-boots.js
console.log('=== Program 694: Mine Ridge Gold & Craft Golden Boots ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

globalThis.configureFireAvoidance();
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Raise offhand shield by default
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
}
bot.activateItem(true);

// 1. Advance along safe trail to (63, 65, -20)
const TRAIL_WAYPOINTS = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 }
];

console.log('Following safe trail to East Ridge (63, 65, -20)...');
for (const wp of TRAIL_WAYPOINTS) {
  if (bot.entity.position.distanceTo(new Vec3(wp.x, wp.y, wp.z)) < 2.5) continue;
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 8000 });
  } catch (e) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 6000 }); } catch (e2) {}
  }
}

console.log('Now at ridge trail pos:', lib.fmt(bot.entity.position));

// 2. Scan for nether_gold_ore within 32 blocks along cliff
const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
const ores = bot.findBlocks({ matching: goldOreId, maxDistance: 32, count: 25 })
  .map(p => bot.blockAt(p))
  .filter(Boolean)
  .filter(b => b.position.y >= 55 && b.position.y <= 75);

console.log(`Found ${ores.length} safe nether_gold_ore blocks!`);

let mined = 0;
for (const ore of ores) {
  if (checkCancelled()) break;
  const totalEquiv = lib.count('gold_ingot') * 9 + lib.count('gold_nugget');
  if (totalEquiv >= 36) {
    console.log('Holding enough gold for golden_boots (36+ nuggets)! Stopping mining.');
    break;
  }

  console.log(`Mining nether_gold_ore at ${lib.fmt(ore.position)}...`);
  try {
    await lib.dig(ore.position.x, ore.position.y, ore.position.z);
    await lib.pickup(3.5);
    mined++;
  } catch (err) {
    console.log('Dig note:', err.message);
  }
}

try { await lib.pickup(4.0); } catch (e) {}

const nuggets = lib.count('gold_nugget');
const ingots = lib.count('gold_ingot');
console.log(`Mining complete. Mined: ${mined} ores. Gold nuggets: ${nuggets}, Gold ingots: ${ingots}`);
bot.chat(`alpha: Gold mining: mined ${mined} ores. Holding ${nuggets} nuggets, ${ingots} ingots.`);

// 3. Craft ingots
if (nuggets >= 9) {
  const craftable = Math.floor(nuggets / 9);
  console.log(`Crafting ${craftable} gold ingots...`);
  try {
    await lib.craft('gold_ingot', craftable);
    console.log('Total ingots now:', lib.count('gold_ingot'));
  } catch (e) {
    console.log('Craft ingot note:', e.message);
  }
}

// 4. Craft golden_boots
if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
  console.log('Crafting golden_boots...');
  try {
    await lib.craft('golden_boots', 1);
    console.log('Crafted golden_boots!');
    await lib.equipArmor();
    bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! Piglins are 100% neutral! Ready for Ender Pearl bartering!');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

bot.deactivateItem();
console.log('=== Program 694 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'Armor:', {
  head: bot.inventory.slots[5]?.name,
  chest: bot.inventory.slots[6]?.name,
  legs: bot.inventory.slots[7]?.name,
  feet: bot.inventory.slots[8]?.name,
  offhand: bot.inventory.slots[45]?.name
}, 'Inv:', lib.inv());
