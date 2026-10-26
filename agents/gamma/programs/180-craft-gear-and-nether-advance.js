// programs/180-craft-gear-and-nether-advance.js
console.log('--- CRAFT GEAR, TAKE FOOD, & ENTER NETHER ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Craft sticks and stone_sword inside base
console.log('Crafting sticks and stone_sword...');
await lib.craft('stick', 4);
await lib.craft('stone_sword', 1);
await lib.equipWeapon();
console.log('Crafted and equipped stone_sword! Tools:', JSON.stringify(lib.tools()));

// 2. Withdraw cooked porkchop from chest at (293, 72, -57)
console.log('Checking chest at (293, 72, -57)...');
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Chest contents:', JSON.stringify(contents));
  if (contents.cooked_porkchop) {
    await lib.withdraw({ cooked_porkchop: 1 }, 293, 72, -57);
    console.log('Withdrew cooked_porkchop!');
  }
} catch (e) {
  console.log('Chest note:', e.message);
}

console.log('Inventory before portal:', JSON.stringify(lib.inv()));
bot.chat(`gamma armed with stone sword, stone pickaxe, food & materials! Heading to Nether portal.`);

// 3. Step outside base door to surface
console.log('Exiting base door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d) await bot.activateBlock(d);
  await lib.walkTo(294.5, -53.0);
}

// 4. Walk to Nether portal at (299, 73, -54)
console.log('Walking into Nether portal at (299, 73, -54)...');
try {
  await lib.walkTo(298.5, -54.0, 3000);
  await lib.walkTo(299.0, -54.0, 3000);
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54)); } catch (e2) {}
}

bot.clearControlStates();
console.log('Inside portal frame! Pos:', lib.fmt(bot.entity.position));

// 5. Wait for transit to Nether
console.log('Standing completely still for 4s transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
  console.log(`Waiting in portal... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
}

if (!String(bot.game.dimension).includes('nether')) {
  console.log('Retrying walk into portal center (299.5, -54.0)...');
  await lib.walkTo(299.5, -54.0, 3000);
  bot.clearControlStates();
  const t1 = Date.now();
  while (!String(bot.game.dimension).includes('nether') && (Date.now() - t1 < 20000) && !isCancelled()) {
    await sleep(1000);
  }
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within deadline');
}

console.log('SUCCESS! Arrived in Nether at:', lib.fmt(bot.entity.position));
console.log('Dimension:', bot.game.dimension);

// 6. Step out of Nether portal to bunker floor at (40.5, 65, -5) to clear portal cooldown
console.log('Stepping out of portal to bunker floor at (40.5, 65, -5)...');
await lib.walkTo(40.5, -5.0, 3000);
bot.clearControlStates();
console.log('Pos in Nether bunker:', lib.fmt(bot.entity.position));

bot.chat(`gamma arrived in Nether bunker ${lib.fmt(bot.entity.position)}! Dimension: ${bot.game.dimension}. Ready for East Ridge march.`);

// 7. Check for nether_gold_ore around bunker
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
    console.log('Crafting golden_boots for Piglin neutrality...');
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
