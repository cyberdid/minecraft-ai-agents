// programs/184-step-up-into-portal.js
console.log('--- JUMP UP AND STEP INTO NETHER PORTAL ---');
console.log('Start pos:', bot.entity.position);

// Jump up onto portal sill (y=73) while walking forward into (299.5, -54.0)
console.log('Stepping up and forward into portal (299.5, 73, -54)...');
bot.setControlState('jump', true);
await lib.walkTo(299.5, -54.0, 3000);
bot.setControlState('jump', false);
bot.clearControlStates();

console.log('Pos after step:', bot.entity.position);
const standingIn = bot.blockAt(bot.entity.position);
console.log('Standing in:', standingIn?.name, 'at', standingIn?.position);

if (standingIn?.name !== 'nether_portal') {
  // Try 300.0, -54.0
  console.log('Trying x=300 portal block...');
  bot.setControlState('jump', true);
  await lib.walkTo(300.0, -54.0, 2000);
  bot.setControlState('jump', false);
  bot.clearControlStates();
  console.log('Pos now:', bot.entity.position);
  console.log('Standing in:', bot.blockAt(bot.entity.position)?.name);
}

// Stand still for transit
console.log('Standing completely still for 4s transit to Nether...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
  console.log(`Waiting in portal... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within deadline');
}

console.log('SUCCESS! In the Nether! Dim:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// Step out to bunker floor (40.5, 65, -5) to clear portal cooldown
console.log('Stepping out of portal to bunker floor (40.5, 65, -5)...');
await lib.walkTo(40.5, -5.0, 3000);
bot.clearControlStates();
console.log('Bunker pos:', lib.fmt(bot.entity.position));

bot.chat(`gamma arrived in Nether bunker ${lib.fmt(bot.entity.position)}! Advancing along East Ridge trail.`);

// Check nether_gold_ore
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
