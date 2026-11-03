// programs/481-enter-nether-mine-gold.js
console.log('=== GAMMA: ENTER NETHER & MINE GOLD FOR PIGLIN NEUTRALITY ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Enter Nether Portal if in Overworld
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Heading through portal into Nether to mine gold ore for golden_boots & Piglin bartering!');

  // Exit base door
  if (bot.entity.position.z < -53.2) {
    try {
      await lib.door(294, 72, -54, true);
      await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52.5, 0.5));
      await lib.door(294, 72, -54, false);
    } catch (e) {
      try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
    }
  }

  // Walk to portal sill at (299.5, 72.0, -52.5)
  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 72.0, -52.5, 0.6));
  } catch (e) {
    await lib.goToXZ(299.5, -52.5, { timeoutMs: 8000 });
  }

  // Step into active nether_portal block at (299.5, 73.0, -53.5)
  const target = new Vec3(299.5, 73.0, -53.5);
  await bot.lookAt(target, true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(1000);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);
  bot.clearControlStates();

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    await sleep(250);
  }
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Failed to warp to Nether. Halting.');
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

console.log('Successfully in the_nether! Pos:', lib.fmt(bot.entity.position));

// 2. Step out of portal into bunker at (42, 65, -7)
try {
  await bot.pathfinder.goto(new goals.GoalNear(42, 65, -7, 0.8));
} catch (e) {
  await bot.lookAt(new Vec3(42, 65, -7), true);
  bot.setControlState('forward', true);
  await sleep(800);
  bot.setControlState('forward', false);
}

// 3. Configure Nether pathfinder
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

// 4. Search and mine nether_gold_ore blocks near the bunker & East Ridge
let minedCount = 0;
const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
console.log('Searching for nether_gold_ore (id: ' + goldOreId + ')...');

for (let attempt = 0; attempt < 8 && !isCancelled(); attempt++) {
  const currentNuggets = lib.count('gold_nugget');
  const currentIngots = lib.count('gold_ingot');
  console.log(`Inventory: nuggets=${currentNuggets}, ingots=${currentIngots}, boots=${lib.count('golden_boots')}`);

  if (currentNuggets + currentIngots * 9 >= 36 && lib.count('golden_boots') === 0) {
    console.log('Have enough gold for golden_boots! Crafting...');
    try {
      const needIngots = 4 - lib.count('gold_ingot');
      if (needIngots > 0) {
        await lib.craft('gold_ingot', needIngots);
      }
      await lib.craft('golden_boots', 1);
      await lib.equipArmor();
      bot.chat('gamma: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% Piglin neutrality achieved!');
      console.log('Golden boots crafted and equipped!');
      break;
    } catch (e) {
      console.log('Crafting boots warning:', e.message);
    }
  }

  // Find gold ore blocks within 24m
  const goldOres = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 24,
    count: 10
  });

  if (goldOres.length === 0) {
    console.log(`No gold ores visible from ${lib.fmt(bot.entity.position)}. Moving along East Ridge to find more...`);
    // Move slightly forward along safe East Ridge trail
    const trailPositions = [
      new Vec3(46, 65, -7),
      new Vec3(54, 65, -7),
      new Vec3(63, 64, -7),
      new Vec3(63, 65, -20),
      new Vec3(63, 66, -35)
    ];
    const nextTrail = trailPositions[attempt % trailPositions.length];
    try {
      await bot.pathfinder.goto(new goals.GoalNear(nextTrail.x, nextTrail.y, nextTrail.z, 1.5));
    } catch (e) {}
    continue;
  }

  for (const orePos of goldOres) {
    if (isCancelled()) break;
    // Don't mine blocks right over lava
    const below = bot.blockAt(orePos.offset(0, -1, 0));
    if (below && below.name === 'lava') continue;

    console.log(`Mining nether_gold_ore at ${lib.fmt(orePos)}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.5));
      await lib.dig(orePos.x, orePos.y, orePos.z);
      await lib.pickup(3.5);
      minedCount++;
      console.log(`Mined gold ore #${minedCount}! Total nuggets: ${lib.count('gold_nugget')}`);
    } catch (e) {
      console.log(`Failed to mine ore at ${lib.fmt(orePos)}:`, e.message);
    }
  }
}

// 5. Craft golden_boots if we have 36+ nuggets
const finalNuggets = lib.count('gold_nugget');
const finalIngots = lib.count('gold_ingot');
if (finalNuggets + finalIngots * 9 >= 36 && lib.count('golden_boots') === 0) {
  try {
    const needIngots = 4 - lib.count('gold_ingot');
    if (needIngots > 0) {
      await lib.craft('gold_ingot', needIngots);
    }
    await lib.craft('golden_boots', 1);
    await lib.equipArmor();
    bot.chat('gamma: CRAFTED AND EQUIPPED GOLDEN BOOTS! Piglins are now 100% neutral!');
  } catch (e) {
    console.log('Craft golden_boots error:', e.message);
  }
}

// If we have extra gold ingots, craft more ingots for bartering
const extraNuggets = lib.count('gold_nugget');
if (extraNuggets >= 9) {
  try {
    const craftIngots = Math.floor(extraNuggets / 9);
    await lib.craft('gold_ingot', craftIngots);
    console.log(`Crafted ${craftIngots} gold ingots for Piglin bartering!`);
  } catch (e) {}
}

bot.chat(`gamma: Gold mining round complete. Mined: ${minedCount} ores, Nuggets: ${lib.count('gold_nugget')}, Ingots: ${lib.count('gold_ingot')}, Boots: ${lib.count('golden_boots')}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  mined: minedCount,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  boots: lib.count('golden_boots'),
  inv: lib.inv()
};
