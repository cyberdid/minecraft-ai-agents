// programs/183-transit-to-nether.js
console.log('--- NAVIGATE TO PORTAL VIA SOUTH PATH & TRANSIT ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Walk to base door at (294.5, 72, -54)
console.log('Stepping through base door to z=-52...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d) await bot.activateBlock(d);
}

// Ensure at (294.5, -52.0)
await lib.walkTo(294.5, -52.0, 3000);
console.log('Outside door at:', lib.fmt(bot.entity.position));

// 2. Walk East along z=-52 to (299.5, -52.0)
console.log('Walking East along z=-52 to (299.5, -52.0)...');
await lib.walkTo(299.5, -52.0, 4000);
console.log('At x=299 corner:', lib.fmt(bot.entity.position));

// 3. Step North directly into portal block (299.5, 73, -54.0)
console.log('Stepping North into Nether portal at (299.5, -54.0)...');
await lib.walkTo(299.5, -54.0, 3000);
bot.clearControlStates();

console.log('Inside portal frame! Pos:', bot.entity.position);
const standingIn = bot.blockAt(bot.entity.position);
console.log('Standing in:', standingIn?.name, 'at', standingIn?.position);

// 4. Stand still for 4s transit
console.log('Standing still for transit to Nether...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
  console.log(`Waiting in portal... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within deadline');
}

console.log('SUCCESS! In the Nether! Dim:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// 5. Step out of Nether portal to bunker floor at (40.5, 65, -5) to clear portal cooldown
console.log('Stepping out of portal to bunker floor (40.5, 65, -5)...');
await lib.walkTo(40.5, -5.0, 3000);
bot.clearControlStates();
console.log('Bunker pos:', lib.fmt(bot.entity.position));

bot.chat(`gamma arrived in Nether bunker ${lib.fmt(bot.entity.position)}! Fully armed with stone tools and food.`);

// 6. Check for nether_gold_ore near bunker
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
