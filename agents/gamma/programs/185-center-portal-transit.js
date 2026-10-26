// programs/185-center-portal-transit.js
console.log('--- DEAD CENTER PORTAL ENTRY AND NETHER ADVANCE ---');
console.log('Start pos:', bot.entity.position);

// Walk to exact dead center of portal block: (299.5, 73.0, -53.5)
console.log('Walking to dead center of portal (299.5, 73.0, -53.5)...');
await lib.walkTo(299.5, -53.5, 3000);
bot.clearControlStates();

console.log('Pos at center:', bot.entity.position);
const standingIn = bot.blockAt(bot.entity.position);
console.log('Standing in:', standingIn?.name, 'at', standingIn?.position);

// Stand completely still for 4s transit
console.log('Standing still for transit to Nether...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
  console.log(`Waiting in portal... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 25s');
}

console.log('SUCCESS! In the Nether! Dim:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// Step out to bunker floor (40.5, 65, -5.0) to clear portal cooldown
console.log('Stepping out of portal to bunker floor (40.5, 65, -5.0)...');
await lib.walkTo(40.5, -5.0, 3000);
bot.clearControlStates();
console.log('Bunker pos:', lib.fmt(bot.entity.position));

bot.chat(`gamma arrived in Nether bunker ${lib.fmt(bot.entity.position)}! Dimension: ${bot.game.dimension}. Gearing up.`);

// Mine nether_gold_ore if available for boots
const goldOres = bot.findBlocks({
  matching: b => b && b.name === 'nether_gold_ore',
  maxDistance: 12,
  count: 6
});
console.log(`Found ${goldOres.length} nether_gold_ore near bunker:`, goldOres.map(p => lib.fmt(p)));

if (goldOres.length > 0) {
  const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
  if (pick) await bot.equip(pick, 'hand');

  for (const gp of goldOres) {
    if (lib.count('gold_nugget') >= 36 || isCancelled()) break;
    try {
      console.log(`Digging nether_gold_ore at ${lib.fmt(gp)}...`);
      await lib.dig(gp.x, gp.y, gp.z);
      await sleep(150);
      await lib.pickup(4);
    } catch (e) {
      console.log('Gold dig note:', e.message);
    }
  }

  console.log('Gold nuggets collected:', lib.count('gold_nugget'));
  if (lib.count('gold_nugget') >= 36) {
    console.log('Crafting golden_boots...');
    await lib.craft('gold_ingot', 4);
    await lib.craft('golden_boots', 1);
    await lib.equipArmor();
    console.log('GOLDEN BOOTS EQUIPPED!');
    bot.chat('gamma EQUIPPED GOLDEN BOOTS! Piglins are neutral.');
  }
}

console.log('Final pos in Nether:', lib.fmt(bot.entity.position));
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
