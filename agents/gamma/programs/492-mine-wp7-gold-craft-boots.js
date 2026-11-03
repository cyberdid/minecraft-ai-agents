// programs/492-mine-wp7-gold-craft-boots.js
console.log('=== GAMMA: ADVANCE TO WP 7-8 GOLD VEIN & CRAFT BOOTS ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Configure safe movement
const netherMoves = new Movements(bot, mcData);
const avoidBlocks = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id, mcData.blocksByName.lava?.id].filter(Boolean);
for (const id of avoidBlocks) netherMoves.blocksToAvoid.add(id);
netherMoves.canDig = true;
netherMoves.maxDropDown = 2;
netherMoves.allowParkour = false;
bot.pathfinder.setMovements(netherMoves);

const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// 2. Walk to East Ridge WP 7 at (63, 65, -20) and WP 8 at (63, 65, -28)
const WAYPOINTS = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 65, z: -28 }
];

for (let i = 0; i < WAYPOINTS.length && !isCancelled(); i++) {
  if (lib.count('gold_nugget') >= 9 || lib.count('gold_ingot') >= 4) break;
  const wp = WAYPOINTS[i];
  console.log(`Walking to WP ${i + 1} (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 8000 }); } catch (e2) {}
  }

  // Check for nether_gold_ore
  const ores = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 16,
    count: 4
  });

  if (ores.length > 0) {
    console.log(`Found ${ores.length} gold ores near WP ${i + 1}!`);
    for (const orePos of ores) {
      if (lib.count('gold_nugget') >= 9) break;
      try {
        await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.5));
        await lib.dig(orePos.x, orePos.y, orePos.z);
        await lib.pickup(4.0);
        console.log(`Mined gold ore at ${lib.fmt(orePos)}! Total nuggets: ${lib.count('gold_nugget')}`);
      } catch (e) {
        console.log('Mine error:', e.message);
      }
    }
  }
}

console.log(`Mining complete. Ingots: ${lib.count('gold_ingot')}, Nuggets: ${lib.count('gold_nugget')}`);

// 3. Return to Nether Base Camp bunker at (41, 65, -6)
console.log('Returning to bunker Crafting Table at (41, 65, -6)...');
const revWaypoints = [
  { x: 63, y: 64, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 46, y: 65, z: -7 },
  { x: 41, y: 65, z: -6 }
];

for (const wp of revWaypoints) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 6000 }); } catch (e2) {}
  }
}

// 4. Craft at Crafting Table (41, 65, -6)
const tableBlock = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 8 });
if (tableBlock) {
  console.log('At Crafting Table!');
  // Craft 4th ingot if we have 9+ nuggets
  if (lib.count('gold_nugget') >= 9 && lib.count('gold_ingot') < 4) {
    try {
      await lib.craft('gold_ingot', 4 - lib.count('gold_ingot'));
      console.log('Crafted 4th gold ingot! Total ingots:', lib.count('gold_ingot'));
    } catch (e) {
      console.log('Craft ingot error:', e.message);
    }
  }

  // Craft golden_boots!
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    try {
      await lib.craft('golden_boots', 1);
      await lib.equipArmor();
      bot.chat('gamma: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% Piglin neutrality ACTIVE!');
      console.log('*** GOLDEN BOOTS EQUIPPED! PIGLIN NEUTRALITY ACTIVE! ***');
    } catch (e) {
      console.log('Craft boots error:', e.message);
    }
  }

  // Craft any extra nuggets into ingots
  const extraNuggets = lib.count('gold_nugget');
  if (extraNuggets >= 9) {
    try {
      await lib.craft('gold_ingot', Math.floor(extraNuggets / 9));
    } catch (e) {}
  }
}

const finalBoots = lib.count('golden_boots');
const finalIngots = lib.count('gold_ingot');
const finalPearls = lib.count('ender_pearl');

bot.chat(`gamma: Status: Golden Boots: ${finalBoots}, Barter Ingots: ${finalIngots}, Ender Pearls: ${finalPearls}/12, HP: ${bot.health.toFixed(1)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  boots: finalBoots,
  ingots: finalIngots,
  pearls: finalPearls,
  inv: lib.inv()
};
