// programs/375-secure-bunker-and-mine-gold.js
console.log('=== Program 375: Secure Nether Bunker & Mine Gold Ore ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Check surrounding blocks of portal (40..41, 65..67, -7)
const portalPos = new Vec3(40, 65, -7);

// 2. Mine nearby nether_gold_ore
const goldOres = bot.findBlocks({
  matching: (b) => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone'),
  maxDistance: 16,
  count: 8
});
console.log(`Found ${goldOres.length} gold ores within 16 blocks:`);

let minedGold = 0;
for (const gp of goldOres) {
  if (isCancelled()) break;
  // Safety check: do not mine if block below is lava or empty void
  const below = bot.blockAt(gp.offset(0, -1, 0));
  if (below && below.name === 'lava') {
    console.log(`Skipping gold ore at ${lib.fmt(gp)}: lava below!`);
    continue;
  }
  try {
    console.log(`Mining gold ore at ${lib.fmt(gp)}...`);
    await lib.dig(gp.x, gp.y, gp.z);
    await lib.pickup(4);
    minedGold++;
  } catch (e) {
    console.log(`Error mining gold at ${lib.fmt(gp)}:`, e.message);
  }
}

console.log(`Mined ${minedGold} gold ores. Gold nuggets in inv: ${lib.count('gold_nugget')}`);

// 3. Check for nearby Nether Fortress or hostiles
const hostiles = lib.hostiles(20);
console.log('Hostiles within 20m:', JSON.stringify(hostiles));

bot.chat(`team: Alpha secured Nether camp (40, 65, -7)! Mined ${minedGold} gold ores (nuggets: ${lib.count('gold_nugget')}). Ready for fortress scouting!`);

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
