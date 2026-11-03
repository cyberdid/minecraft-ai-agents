// programs/483-clean-portal-warp-and-mine.js
console.log('=== GAMMA: DIRECT PORTAL WARP & GOLD MINING ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Ensure sword and shield equipped
try { await lib.equipWeapon(); } catch (e) {}
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}

// 2. Warp into Nether
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Moving 8m directly into Nether portal at (299.5, 73, -53.5)...');

  // Approach portal sill
  try {
    await lib.goTo(299.5, 72.0, -52.5, 0.8, { timeoutMs: 6000 });
  } catch (e) {
    try { await lib.goToXZ(299.5, -52.5, { timeoutMs: 5000 }); } catch (e2) {}
  }

  // Step directly into the portal block
  const portalBlock = new Vec3(299.5, 73.0, -53.5);
  await bot.lookAt(portalBlock, true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 72.5) bot.setControlState('jump', true);
  await sleep(400);
  bot.clearControlStates();

  bot.pathfinder.stop();
  bot.pathfinder.setGoal(null);

  console.log('Standing completely still inside portal at:', lib.fmt(bot.entity.position));
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
    await sleep(250);
  }
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Warp failed. Pos:', lib.fmt(bot.entity.position));
  return { dim: bot.game.dimension, pos: bot.entity.position };
}

console.log('WARP SUCCESS! In the_nether at:', lib.fmt(bot.entity.position));
bot.chat('gamma: Inside Nether Base Camp bunker! Mining Nether Gold Ore for golden_boots & Piglin bartering!');

// 3. Step forward into bunker floor
await sleep(400);
await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(800);
bot.setControlState('forward', false);
bot.clearControlStates();

// 4. Configure Nether movements
const netherMoves = new Movements(bot, mcData);
const avoidBlocks = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id, mcData.blocksByName.lava?.id].filter(Boolean);
for (const id of avoidBlocks) netherMoves.blocksToAvoid.add(id);
netherMoves.canDig = true;
netherMoves.maxDropDown = 2;
netherMoves.allowParkour = false;
bot.pathfinder.setMovements(netherMoves);

// Equip pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// 5. Mine nether_gold_ore
let minedCount = 0;
for (let round = 0; round < 6 && !isCancelled(); round++) {
  const currentNuggets = lib.count('gold_nugget');
  const currentIngots = lib.count('gold_ingot');
  console.log(`Round ${round + 1}: Nuggets=${currentNuggets}, Ingots=${currentIngots}, Boots=${lib.count('golden_boots')}`);

  if (currentNuggets + currentIngots * 9 >= 36 && lib.count('golden_boots') === 0) {
    console.log('Crafting golden_boots...');
    try {
      const needIngots = 4 - lib.count('gold_ingot');
      if (needIngots > 0) await lib.craft('gold_ingot', needIngots);
      await lib.craft('golden_boots', 1);
      await lib.equipArmor();
      bot.chat('gamma: EQUIPPED GOLDEN BOOTS! 100% Piglin neutrality active!');
      break;
    } catch (e) {
      console.log('Craft boots error:', e.message);
    }
  }

  const ores = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 20,
    count: 8
  });

  if (ores.length === 0) {
    // Advance along covered ridge trail to find ore
    const waypoints = [
      { x: 46, y: 65, z: -7 },
      { x: 54, y: 65, z: -7 },
      { x: 63, y: 64, z: -7 },
      { x: 63, y: 65, z: -20 }
    ];
    const wp = waypoints[round % waypoints.length];
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
    } catch (e) {}
    continue;
  }

  for (const orePos of ores) {
    if (isCancelled()) break;
    const below = bot.blockAt(orePos.offset(0, -1, 0));
    if (below && below.name === 'lava') continue;

    console.log(`Mining nether_gold_ore at ${lib.fmt(orePos)}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.5));
      await lib.dig(orePos.x, orePos.y, orePos.z);
      await lib.pickup(3.5);
      minedCount++;
    } catch (e) {
      console.log('Mine error:', e.message);
    }
  }
}

// 6. Final crafting check
const finalNuggets = lib.count('gold_nugget');
const finalIngots = lib.count('gold_ingot');
if (finalNuggets + finalIngots * 9 >= 36 && lib.count('golden_boots') === 0) {
  try {
    const needIngots = 4 - lib.count('gold_ingot');
    if (needIngots > 0) await lib.craft('gold_ingot', needIngots);
    await lib.craft('golden_boots', 1);
    await lib.equipArmor();
    bot.chat('gamma: EQUIPPED GOLDEN BOOTS! 100% Piglin neutrality active!');
  } catch (e) {}
}

const extraNuggets = lib.count('gold_nugget');
if (extraNuggets >= 9) {
  try {
    const ingotsToCraft = Math.floor(extraNuggets / 9);
    await lib.craft('gold_ingot', ingotsToCraft);
  } catch (e) {}
}

bot.chat(`gamma: Mining session complete. Mined ${minedCount} ores. Holding ${lib.count('gold_ingot')} gold ingots, ${lib.count('gold_nugget')} nuggets, boots: ${lib.count('golden_boots')}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  mined: minedCount,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  boots: lib.count('golden_boots'),
  inv: lib.inv()
};
