// programs/693-enter-nether-mine-boots-gold.js
console.log('=== Program 693: Enter Nether, Mine Gold & Craft Golden Boots ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Equip shield and weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
}
console.log('Gear: Offhand =', bot.inventory.slots[45]?.name, 'Held =', bot.heldItem?.name);

// 2. Warp into Nether
if (bot.game.dimension === 'overworld') {
  console.log('Stepping through base door and entering Nether Portal...');
  bot.chat('alpha: Stepping through Nether portal to join Gamma/Beta, mine gold, and craft golden_boots!');
  await globalThis.enterNetherPortal();
}

console.log('Dimension now:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  globalThis.configureFireAvoidance();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // Keep shield raised for defense
  bot.activateItem(true);

  // Scan teammates in visual range
  for (const name of ['beta', 'gamma', 'delta']) {
    const p = bot.players[name]?.entity;
    if (p) console.log(`Teammate ${name} at ${lib.fmt(p.position)}`);
  }

  // Find nether_gold_ore within 24 blocks around base camp
  const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
  const ores = bot.findBlocks({ matching: goldOreId, maxDistance: 24, count: 15 })
    .map(p => bot.blockAt(p))
    .filter(Boolean)
    .filter(b => b.position.y >= 60 && b.position.y <= 75);

  console.log(`Found ${ores.length} safe nether_gold_ore blocks!`);

  let mined = 0;
  for (const ore of ores) {
    if (checkCancelled()) break;
    const totalEquiv = lib.count('gold_ingot') * 9 + lib.count('gold_nugget');
    if (totalEquiv >= 36) {
      console.log('Reached 36+ gold nuggets (4 ingots)! Stopping mining.');
      break;
    }

    console.log(`Mining nether_gold_ore at ${lib.fmt(ore.position)}...`);
    try {
      await lib.dig(ore.position.x, ore.position.y, ore.position.z);
      await lib.pickup(3.5);
      mined++;
    } catch (e) {
      console.log('Dig note:', e.message);
    }
  }

  try { await lib.pickup(4); } catch (e) {}

  console.log(`Gold on Alpha: ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets.`);
  bot.chat(`alpha: Mined ${mined} gold ores. Holding ${lib.count('gold_ingot')} ingots, ${lib.count('gold_nugget')} nuggets.`);

  // Craft ingots from nuggets
  if (lib.count('gold_nugget') >= 9) {
    const craftable = Math.floor(lib.count('gold_nugget') / 9);
    try {
      await lib.craft('gold_ingot', craftable);
      console.log(`Crafted ingots! Total ingots: ${lib.count('gold_ingot')}`);
    } catch (e) {}
  }

  // Craft golden_boots if 4+ ingots
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    console.log('Crafting golden_boots...');
    try {
      await lib.craft('golden_boots', 1);
      console.log('golden_boots crafted successfully!');
      await lib.equipArmor();
      bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! 100% Piglin neutrality ACTIVE!');
    } catch (e) {
      console.log('Craft boots note:', e.message);
    }
  }

  bot.deactivateItem();
}

console.log('=== Program 693 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Armor:', bot.inventory.slots.slice(5, 9).map(s => s?.name), 'Inv:', lib.inv());
