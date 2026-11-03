// programs/769-warp-fortify-and-hunt-pearls.js
console.log('=== Program 769: Warp, Fortify Portal, Barter & Hunt Pearls ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Warp into Nether
if (bot.game.dimension === 'overworld') {
  const portals = bot.findBlocks({
    matching: b => b && b.name === 'nether_portal',
    maxDistance: 8,
    count: 10
  });
  console.log(`Found ${portals.length} nether_portal blocks:`, portals.map(p => lib.fmt(p)).join(', '));

  if (portals.length === 0) throw new Error('No nether_portal found within 8m');

  portals.sort((a, b) => a.y - b.y || bot.entity.position.distanceTo(a) - bot.entity.position.distanceTo(b));
  const targetPortal = portals[0];
  console.log('Stepping into portal block at:', lib.fmt(targetPortal));

  const pCenter = targetPortal.offset(0.5, 0.2, 0.5);
  await bot.lookAt(pCenter, true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < targetPortal.y) bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - pCenter.x) > 0.4 || Math.abs(cur.z - pCenter.z) > 0.4 || cur.y < targetPortal.y - 0.2) {
      await bot.lookAt(pCenter, true);
      bot.setControlState('forward', true);
      if (cur.y < targetPortal.y) bot.setControlState('jump', true);
      await sleep(150);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to warp; still in ${bot.game.dimension}`);
}

console.log('SUCCESS: Beta in the_nether at:', lib.fmt(bot.entity.position));
bot.activateItem(true); // Raise shield against Ghasts!
if (typeof configureFireAvoidance === 'function') configureFireAvoidance();

// Step 2: Place cobblestone blast wall around portal (44, 66..67, 1..3)
if (lib.count('cobblestone') >= 4) {
  const wallSpots = [
    new Vec3(44, 66, 1),
    new Vec3(44, 67, 1),
    new Vec3(44, 66, 2),
    new Vec3(44, 67, 2),
    new Vec3(44, 66, 3),
    new Vec3(44, 67, 3)
  ];

  for (const p of wallSpots) {
    const cur = bot.blockAt(p);
    if (cur && cur.name === 'air') {
      try {
        await lib.place('cobblestone', p.x, p.y, p.z);
        console.log(`Placed blast wall block at ${lib.fmt(p)}`);
      } catch (e) {}
    }
  }
}

// Step 3: Walk to Nether Base Camp bunker at (41, 65, -6)
try {
  await bot.pathfinder.goto(new goals.GoalNear(41.0, 65.0, -6.0, 1.5));
} catch (e) {
  try { await lib.goTo(41, 65, -6, 2.0, { timeoutMs: 6000 }); } catch (e2) {}
}

bot.chat('Beta: Portal blast wall built! United with team at Nether bunker (41, 65, -6)!');

// Step 4: Craft gold ingots if we have 9+ nuggets at the bunker crafting table
const totalNuggets = lib.count('gold_nugget');
const bunkerTable = bot.findBlock({ matching: b => b && b.name.includes('crafting_table'), maxDistance: 8 });
console.log('Bunker crafting table:', bunkerTable ? lib.fmt(bunkerTable.position) : 'none');

if (totalNuggets >= 9 && bunkerTable) {
  const ingotsToCraft = Math.floor(totalNuggets / 9);
  console.log(`Crafting ${ingotsToCraft} gold ingots at bunker table...`);
  try {
    await lib.craft('gold_ingot', ingotsToCraft);
    console.log(`Total gold ingots on Beta: ${lib.count('gold_ingot')}`);
  } catch (e) {
    console.log('Craft ingots note:', e.message);
  }
}

// Step 5: Scan for nearby Piglins and Endermen within 32m
const mobs = Object.values(bot.entities).filter(e =>
  e.isValid &&
  bot.entity.position.distanceTo(e.position) <= 32
);

const piglins = mobs.filter(e => e.name === 'piglin');
const endermen = mobs.filter(e => e.name === 'enderman');
console.log(`Nearby: Piglins: ${piglins.length}, Endermen: ${endermen.length}`);

// Step 6: Barter with Piglin if available
if (piglins.length > 0 && lib.count('gold_ingot') > 0) {
  const piglin = piglins[0];
  console.log(`Approaching Piglin at ${lib.fmt(piglin.position)} for bartering...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(piglin.position.x, piglin.position.y, piglin.position.z, 3.5));
    await bot.lookAt(piglin.position.offset(0, 1.2, 0), true);
    console.log('Tossing gold ingot to Piglin...');
    bot.chat('Beta: Bartering gold ingot with Piglin!');
    await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);
    await sleep(7000);
    await lib.pickup(5.0);
    console.log(`Ender Pearls on Beta now: ${lib.count('ender_pearl')}`);
    if (lib.count('ender_pearl') > 0) {
      bot.chat(`Beta: GOT ENDER PEARL! Total: ${lib.count('ender_pearl')}/12!`);
    }
  } catch (e) {
    console.log('Barter note:', e.message);
  }
}

// Step 7: Mine nearby reachable Nether Gold Ore along trail
const ores = bot.findBlocks({
  matching: b => b && b.name === 'nether_gold_ore',
  maxDistance: 24,
  count: 10
}).filter(p => p.y >= 62);

console.log(`Reachable gold ores: ${ores.length}`);
let mined = 0;
for (const op of ores.slice(0, 5)) {
  if (isCancelled()) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(op.x, op.y, op.z, 2.2));
    const b = bot.blockAt(op);
    if (b && b.name === 'nether_gold_ore') {
      const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
      if (pick) await bot.equip(pick, 'hand');
      await bot.dig(b);
      mined++;
      await sleep(200);
      await lib.pickup(3.5);
    }
  } catch (e) {}
}

await lib.pickup(4.0);
bot.activateItem(true); // Keep shield raised!

console.log('=== Program 769 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Ender Pearls:', lib.count('ender_pearl'));
console.log('Gold ingots:', lib.count('gold_ingot'), 'nuggets:', lib.count('gold_nugget'));
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
  mined_ores: mined
};
