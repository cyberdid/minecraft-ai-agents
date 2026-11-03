// programs/681-mine-nether-gold.js
console.log('=== Program 681: Mine Nether Gold for Piglin Neutrality & Bartering ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. If in Overworld, warp cleanly into the Nether
if (bot.game.dimension === 'overworld') {
  console.log('Entering Nether Portal to mine Nether gold...');
  bot.chat('alpha: Entering Nether to mine gold ore for golden boots & Ender Pearl bartering!');
  await globalThis.enterNetherPortal();
}

console.log('Now in dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  globalThis.configureFireAvoidance();
  try { await lib.equipArmor(); } catch (e) {}
  try { await lib.equipWeapon(); } catch (e) {}

  // Walk onto safe East Ridge trail (63, 65, -20)
  console.log('Moving to safe East Ridge trail (63, 65, -20)...');
  try {
    await lib.goTo(63, 65, -20, 2, { dig: false, timeoutMs: 15000 });
  } catch (e) {
    try { await lib.goToXZ(63, -20, { timeoutMs: 10000 }); } catch (e2) {}
  }

  // Search for nether_gold_ore within 24 blocks along ridge
  console.log('Scanning for nether_gold_ore...');
  const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
  const ores = bot.findBlocks({ matching: goldOreId, maxDistance: 24, count: 20 })
    .map(p => bot.blockAt(p))
    .filter(Boolean)
    .filter(b => b.position.y >= 60 && b.position.y <= 75); // Stay safe on ridge, avoid lava lake below y=50

  console.log(`Found ${ores.length} safe nether_gold_ore blocks on ridge!`);
  let mined = 0;

  for (const ore of ores) {
    if (checkCancelled()) break;
    // If we have enough for boots (36 nuggets = 4 ingots), we can stop
    const nuggets = lib.count('gold_nugget') + (lib.count('gold_ingot') * 9);
    if (nuggets >= 36) {
      console.log(`Already have ${nuggets} gold nuggets (enough for boots)!`);
      break;
    }

    const op = ore.position;
    console.log(`Mining nether_gold_ore at ${lib.fmt(op)}...`);
    try {
      await lib.dig(op.x, op.y, op.z);
      await lib.pickup(4);
      mined++;
    } catch (err) {
      console.log('Mining note:', err.message);
    }
  }

  try { await lib.pickup(5); } catch (e) {}

  const finalNuggets = lib.count('gold_nugget');
  console.log(`Mined ${mined} gold ore blocks. Current gold_nugget: ${finalNuggets}, gold_ingot: ${lib.count('gold_ingot')}`);
  bot.chat(`alpha: Gold mining round complete. Mined ${mined} ores, holding ${finalNuggets} gold nuggets!`);

  // Craft gold ingots if 9+ nuggets
  if (lib.count('gold_nugget') >= 9) {
    const ingotsToCraft = Math.floor(lib.count('gold_nugget') / 9);
    console.log(`Crafting ${ingotsToCraft} gold ingots...`);
    try {
      await lib.craft('gold_ingot', ingotsToCraft);
      console.log(`Total gold_ingots now: ${lib.count('gold_ingot')}`);
      bot.chat(`alpha: Crafted gold ingots! Total ingots: ${lib.count('gold_ingot')}`);
    } catch (e) {
      console.log('Craft ingot note:', e.message);
    }
  }

  // Craft golden_boots if 4+ ingots and don't have golden armor
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    console.log('Crafting golden_boots for Piglin neutrality...');
    try {
      await lib.craft('golden_boots', 1);
      console.log('golden_boots crafted successfully!');
      await lib.equipArmor();
      bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! Piglins are now 100% NEUTRAL!');
    } catch (e) {
      console.log('Craft golden_boots note:', e.message);
    }
  }
}

console.log('=== Program 681 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Inv:', lib.inv());
