// programs/770-craft-ingot-and-scout-ridge.js
console.log('=== Program 770: Craft Ingot, Scout Ridge, Barter & Hunt Pearls ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
if (typeof configureFireAvoidance === 'function') configureFireAvoidance();

// Step 1: Walk to bunker crafting table at (41, 65, -6)
console.log('Walking to bunker crafting table at (41, 65, -6)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(41.0, 65.0, -6.0, 1.5));
} catch (e) {
  try { await lib.goTo(41, 65, -6, 2.0, { timeoutMs: 6000 }); } catch (e2) {}
}

const table = bot.findBlock({ matching: b => b && b.name.includes('crafting_table'), maxDistance: 6 });
console.log('Bunker table found:', table ? lib.fmt(table.position) : 'none');

// Step 2: Craft gold_ingot if nuggets >= 9
const nuggets = lib.count('gold_nugget');
console.log(`Gold nuggets on Beta: ${nuggets}`);
if (nuggets >= 9 && table) {
  try {
    await lib.craft('gold_ingot', Math.floor(nuggets / 9));
    console.log(`Crafted gold ingots! Total ingots now: ${lib.count('gold_ingot')}`);
    bot.chat(`Beta: Crafted ${lib.count('gold_ingot')} Gold Ingot at Nether bunker! Ready to barter!`);
  } catch (e) {
    console.log('Craft ingot note:', e.message);
  }
}

// Step 3: Check nearby entities (teammates, piglins, endermen)
const nearby = Object.values(bot.entities).filter(e =>
  e.isValid && bot.entity.position.distanceTo(e.position) <= 24
);

const piglins = nearby.filter(e => e.name === 'piglin');
const endermen = nearby.filter(e => e.name === 'enderman');
console.log(`Nearby in camp: Piglins: ${piglins.length}, Endermen: ${endermen.length}`);

// Step 4: Advance along safe East Ridge Trail waypoints looking for Piglins and Gold Ore
const ridgeWaypoints = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 }
];

let bartered = 0;
let minedOres = 0;

for (const wp of ridgeWaypoints) {
  if (isCancelled()) break;
  console.log(`Advancing to East Ridge WP at (${wp.x}, ${wp.y}, ${wp.z})...`);
  if (typeof globalThis.clearFireAhead === 'function') await globalThis.clearFireAhead();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
  } catch (e) {
    console.log(`WP goto note:`, e.message);
  }

  // Scan for Piglins at this waypoint
  const curPiglins = Object.values(bot.entities).filter(e =>
    e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 18
  );

  if (curPiglins.length > 0 && lib.count('gold_ingot') > 0) {
    const piglin = curPiglins[0];
    console.log(`Found Piglin at ${lib.fmt(piglin.position)}! Initiating barter...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(piglin.position.x, piglin.position.y, piglin.position.z, 3.5));
      await bot.lookAt(piglin.position.offset(0, 1.2, 0), true);
      bot.chat('Beta: Tossing Gold Ingot to neutral Piglin for Milestone 9 barter!');
      await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);
      bartered++;
      console.log('Waiting 7.5s for Piglin barter drop...');
      await sleep(7500);
      await lib.pickup(5.0);

      const pearls = lib.count('ender_pearl');
      console.log(`Ender pearls after barter: ${pearls}`);
      if (pearls > 0) {
        bot.chat(`Beta: BARTER SUCCESS! Holding ${pearls} Ender Pearls for Milestone 9!`);
      }
    } catch (e) {
      console.log('Barter execution note:', e.message);
    }
  }

  // Scan for nether_gold_ore within 12m along ridge
  const localOres = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 12,
    count: 5
  }).filter(p => p.y >= 62);

  for (const op of localOres) {
    if (isCancelled()) break;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(op.x, op.y, op.z, 2.2));
      const b = bot.blockAt(op);
      if (b && b.name === 'nether_gold_ore') {
        const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
        if (pick) await bot.equip(pick, 'hand');
        await bot.dig(b);
        minedOres++;
        await sleep(200);
        await lib.pickup(3.5);
      }
    } catch (e) {}
  }
}

await lib.pickup(4.0);
bot.activateItem(true); // Keep shield raised!

console.log('=== Program 770 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Ender Pearls:', lib.count('ender_pearl'));
console.log('Gold ingots:', lib.count('gold_ingot'), 'nuggets:', lib.count('gold_nugget'));
console.log('Barters performed:', bartered, 'Ores mined:', minedOres);
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget'),
  bartered,
  minedOres
};
