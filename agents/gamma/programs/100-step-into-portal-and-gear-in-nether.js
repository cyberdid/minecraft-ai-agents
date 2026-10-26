// programs/100-step-into-portal-and-gear-in-nether.js
console.log('--- ENTERING NETHER PORTAL DIRECTLY ---');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Walk straight into portal at (299, 73, -54)
console.log('Walking straight into Nether portal at (299, 73, -54)...');
try {
  await lib.walkTo(299, -54);
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
}

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  // If not transitioned, try GoalBlock inside portal
  console.log('Retrying step into portal block (299, 73, -54)...');
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
  const t1 = Date.now();
  while (!String(bot.game.dimension).includes('nether') && (Date.now() - t1 < 20000) && !isCancelled()) {
    await sleep(1000);
  }
}

console.log('Current dimension:', bot.game.dimension);
console.log('Pos:', lib.fmt(bot.entity.position));

if (String(bot.game.dimension).includes('nether')) {
  bot.chat('gamma in Nether bunker! Checking bunker chest and mining gold for boots.');

  // 2. Inspect and withdraw from bunker chest at (39, 65, -8)
  try {
    const chest = await lib.chestContents(39, 65, -8);
    console.log('Bunker chest contents:', JSON.stringify(chest));
    await lib.withdraw('all', 39, 65, -8);
    console.log('Inventory after withdraw:', JSON.stringify(lib.inv()));
  } catch (e) {
    console.log('Bunker chest note:', e.message);
  }

  // 3. Scan for nether_gold_ore near bunker
  const goldOres = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 20,
    count: 8
  });
  console.log(`Found ${goldOres.length} gold ores nearby.`);

  // If we have a pickaxe, mine gold ore
  if (lib.count('*_pickaxe') > 0) {
    for (const gp of goldOres) {
      if (lib.count('gold_nugget') >= 36) break;
      if (isCancelled()) break;
      try {
        await lib.dig(gp.x, gp.y, gp.z);
        await sleep(200);
        await lib.pickup(4);
      } catch (e) {}
    }

    if (lib.count('gold_nugget') >= 36) {
      console.log('Crafting golden_boots...');
      await lib.craft('gold_ingot', 4);
      await lib.craft('golden_boots', 1);
      await lib.equipArmor();
      console.log('GOLDEN BOOTS EQUIPPED!');
      bot.chat('gamma EQUIPPED GOLDEN BOOTS! Piglins are neutral. Ready to push to Fortress Workshop.');
    }
  }

  console.log('Gamma Nether status: tools=', JSON.stringify(lib.tools()), 'inv=', JSON.stringify(lib.inv()));
}
