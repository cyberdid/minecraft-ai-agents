// programs/486-craft-boots-and-gear.js
console.log('=== GAMMA: DEPOSIT BULK, GET PICKAXE, CRAFT GOLDEN BOOTS ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Open Base Chest at (293, 72, -57) to deposit junk and free inventory
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && bot.game.dimension === 'overworld') {
  try {
    const chest = await bot.openContainer(chestBlock);
    const junk = ['netherrack', 'soul_sand', 'soul_soil', 'bone'];
    for (const j of junk) {
      const item = bot.inventory.items().find(i => i.name === j);
      if (item) {
        await chest.deposit(item.type, null, item.count);
        console.log(`Deposited ${item.name} x${item.count}`);
      }
    }
    // Check if chest has food
    const flesh = chest.containerItems().find(i => i.name === 'rotten_flesh');
    if (flesh && bot.food < 12) {
      await chest.withdraw(flesh.type, null, 1);
      console.log('Withdrew rotten_flesh for emergency food');
    }
    chest.close();
  } catch (e) {
    console.log('Chest deposit error:', e.message);
  }
}

// Eat if we have flesh
const fleshItem = bot.inventory.items().find(i => i.name === 'rotten_flesh');
if (fleshItem && bot.food < 12) {
  try { await bot.equip(fleshItem, 'hand'); bot.activateItem(); await sleep(2000); } catch (e) {}
}

// 2. Ensure we have a stone_pickaxe
if (lib.count('*_pickaxe') === 0) {
  console.log('Obtaining stone_pickaxe...');
  try {
    await lib.obtain('stone_pickaxe', 1);
    console.log('Obtained stone_pickaxe!');
  } catch (e) {
    console.log('Pickaxe obtain error:', e.message);
  }
}

// 3. Step into Nether portal at (299.5, 73.0, -53.5)
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Entering Nether portal to mine 1 gold ore and complete golden_boots!');

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

  // Walk into portal
  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -53.5, 0.4));
  } catch (e) {
    await lib.goToXZ(299.5, -53.5, { timeoutMs: 5000 });
  }

  const portalCenter = new Vec3(299.5, 73.0, -53.5);
  await bot.lookAt(portalCenter, true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
  await sleep(350);
  bot.clearControlStates();

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
    await sleep(250);
  }
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Not in Nether. Pos:', lib.fmt(bot.entity.position));
  return { dim: bot.game.dimension, pos: bot.entity.position };
}

console.log('In the_nether at:', lib.fmt(bot.entity.position));

// 4. In Nether: step out of portal into bunker floor
await sleep(400);
await bot.lookAt(new Vec3(44.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(800);
bot.setControlState('forward', false);

// 5. Mine 1-2 nether_gold_ore blocks near the bunker to get >= 9 nuggets (4th ingot)
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

const currentNuggets = lib.count('gold_nugget');
const currentIngots = lib.count('gold_ingot');
console.log(`Current gold: ${currentIngots} ingots, ${currentNuggets} nuggets`);

if (currentIngots < 4 && currentNuggets < 9) {
  const ores = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 16,
    count: 3
  });
  console.log(`Found ${ores.length} nearby gold ores.`);
  for (const orePos of ores) {
    if (lib.count('gold_nugget') >= 9) break;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.5));
      await lib.dig(orePos.x, orePos.y, orePos.z);
      await lib.pickup(3.5);
    } catch (e) {}
  }
}

// 6. Craft the 4th ingot and golden_boots!
const finalNuggets = lib.count('gold_nugget');
let finalIngots = lib.count('gold_ingot');

if (finalNuggets >= 9 && finalIngots < 4) {
  try {
    const needIngots = 4 - finalIngots;
    await lib.craft('gold_ingot', needIngots);
    console.log(`Crafted ${needIngots} gold ingots!`);
  } catch (e) {
    console.log('Craft ingot error:', e.message);
  }
}

finalIngots = lib.count('gold_ingot');
if (finalIngots >= 4 && lib.count('golden_boots') === 0) {
  try {
    await lib.craft('golden_boots', 1);
    await lib.equipArmor();
    bot.chat('gamma: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% Piglin neutrality ACTIVE!');
    console.log('Golden boots equipped!');
  } catch (e) {
    console.log('Craft boots error:', e.message);
  }
}

// Craft any extra nuggets into ingots for bartering
const extraNuggets = lib.count('gold_nugget');
if (extraNuggets >= 9) {
  try {
    await lib.craft('gold_ingot', Math.floor(extraNuggets / 9));
  } catch (e) {}
}

const finalBoots = lib.count('golden_boots');
const barteringIngots = lib.count('gold_ingot');
bot.chat(`gamma: Ready for Milestone 9 bartering! Golden Boots: ${finalBoots}, Barter Ingots: ${barteringIngots}, Pearls: ${lib.count('ender_pearl')}/12`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  boots: finalBoots,
  barterIngots,
  pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
