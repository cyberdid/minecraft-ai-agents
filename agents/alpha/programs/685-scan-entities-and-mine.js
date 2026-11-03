// programs/685-scan-entities-and-mine.js
console.log('=== Program 685: Scan Entities & Mine Gold for Milestone 9 ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

globalThis.configureFireAvoidance();
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Ensure shield in offhand
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
}
bot.activateItem(true); // Raised shield by default

// 1. Scan players
console.log('Teammates check:');
for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(` - ${name}: pos = ${lib.fmt(p.entity.position)}, held = ${p.entity.heldItem?.name}`);
  } else {
    console.log(` - ${name}: not in visual range`);
  }
}

// 2. Scan for Piglins and Endermen
const mobs = Object.values(bot.entities).filter(e => e.name === 'piglin' || e.name === 'enderman' || e.name === 'piglin_brute');
console.log(`Nearby Piglins/Endermen (${mobs.length}):`);
for (const m of mobs) {
  console.log(` - ${m.name} at ${lib.fmt(m.position)}, dist: ${bot.entity.position.distanceTo(m.position).toFixed(1)}m`);
}

// 3. Move along East Ridge trail towards (63, 65, -25)
console.log('Advancing along East Ridge trail (63, 65, -25)...');
try {
  await lib.goTo(63, 65, -25, 2, { dig: false, timeoutMs: 12000 });
} catch (e) {
  try { await lib.goToXZ(63, -25, { timeoutMs: 8000 }); } catch (e2) {}
}

// 4. Scan for nether_gold_ore within 28 blocks along the netherrack cliff
const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
const ores = bot.findBlocks({ matching: goldOreId, maxDistance: 28, count: 20 })
  .map(p => bot.blockAt(p))
  .filter(Boolean)
  .filter(b => b.position.y >= 58 && b.position.y <= 72);

console.log(`Found ${ores.length} nether_gold_ore blocks along ridge!`);

let mined = 0;
for (const ore of ores) {
  if (checkCancelled()) break;
  const totalEquiv = lib.count('gold_ingot') * 9 + lib.count('gold_nugget');
  if (totalEquiv >= 36) {
    console.log('Enough gold for golden_boots! Stopping mining.');
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

try { await lib.pickup(4); } catch (e) {}

console.log(`Mined ${mined} ores. Nuggets: ${lib.count('gold_nugget')}, Ingots: ${lib.count('gold_ingot')}`);
bot.chat(`alpha: Gold mining: mined ${mined} ores. Holding ${lib.count('gold_nugget')} nuggets, ${lib.count('gold_ingot')} ingots.`);

// 5. Craft ingots if 9+ nuggets
if (lib.count('gold_nugget') >= 9) {
  const craftable = Math.floor(lib.count('gold_nugget') / 9);
  try {
    await lib.craft('gold_ingot', craftable);
    console.log(`Crafted ingots! Total gold_ingot: ${lib.count('gold_ingot')}`);
  } catch (e) {}
}

// 6. Craft golden_boots if 4+ ingots
if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
  console.log('Crafting golden_boots...');
  try {
    await lib.craft('golden_boots', 1);
    await lib.equipArmor();
    console.log('golden_boots crafted and equipped!');
    bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! Piglins are 100% NEUTRAL!');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

bot.deactivateItem();
console.log('=== Program 685 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Armor:', bot.inventory.slots.slice(5, 9).map(s => s?.name), 'Inv:', lib.inv());
