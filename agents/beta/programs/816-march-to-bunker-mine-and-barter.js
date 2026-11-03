// programs/816-march-to-bunker-mine-and-barter.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 816: March to Bunker, Mine Gold Vein & Barter ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots and shield
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) { try { await bot.equip(gb, 'feet'); } catch (e) {} }
}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}
const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe') || bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Step 1: March safe East Ridge waypoints to Fortress Bunker
const marchPoints = [
  new Vec3(62.0, 67.0, -50.0),
  new Vec3(61.5, 67.0, -65.0),
  new Vec3(62.0, 67.0, -80.0),
  new Vec3(61.0, 66.0, -100.0),
  new Vec3(50.0, 65.0, -115.0),
  new Vec3(46.0, 65.0, -122.0),
  new Vec3(44.5, 65.0, -128.0),
  new Vec3(44.0, 65.0, -133.0) // Bunker Crafting Table
];

globalThis.configureFireAvoidance();
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

bot.activateItem(true); // Keep shield raised

for (let i = 0; i < marchPoints.length && !isCancelled(); i++) {
  const wp = marchPoints[i];
  if (bot.entity.position.distanceTo(wp) < 2.0) continue;

  await globalThis.clearFireAhead();
  console.log(`Advancing to WP ${i + 1}/${marchPoints.length}: ${lib.fmt(wp)}`);
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    console.log(`Pathfinder step ${i + 1} retry:`, e.message);
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 6000 }); } catch (e2) {}
  }

  // Vacuum any items on path
  await lib.pickup(3.0);
}

console.log('Pos at Bunker:', lib.fmt(bot.entity.position));

// Step 2: Search for reachable gold ores
const goldOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone'),
  maxDistance: 12,
  count: 15
});
console.log(`Found ${goldOres.length} gold ores near bunker:`, goldOres.map(p => lib.fmt(p)).join(', '));

if (pick) await bot.equip(pick, 'hand');
let minedCount = 0;
for (const op of goldOres) {
  if (minedCount >= 6 || isCancelled()) break;
  const dist = bot.entity.position.distanceTo(op);
  if (dist <= 4.5) {
    const ob = bot.blockAt(op);
    if (ob && ob.name.includes('gold')) {
      console.log(`Mining gold ore at ${lib.fmt(op)}...`);
      try {
        await bot.dig(ob, true);
        minedCount++;
      } catch (e) {}
    }
  }
}

await lib.pickup(5.0);
console.log('Gold nuggets in inv:', lib.count('gold_nugget'));

// Step 3: Craft gold ingots at Crafting Table (44, 65, -134)
try {
  await lib.goTo(44, 65, -134, 1.2, { timeoutMs: 4000 });
} catch (e) {}

const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  const toCraft = Math.floor(nuggets / 9);
  console.log(`Crafting ${toCraft} gold ingots...`);
  try {
    await lib.craft('gold_ingot', toCraft);
    console.log(`Total gold ingots now: ${lib.count('gold_ingot')}`);
    bot.chat(`Beta: Crafted ${toCraft} gold ingots for Piglin bartering! Total: ${lib.count('gold_ingot')}!`);
  } catch (e) {}
}

// Step 4: Scan for nearby Piglins
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 18);
console.log(`Piglins found nearby (${piglins.length}):`, piglins.map(p => `${lib.fmt(p.position)} dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}`).join(', '));

// Step 5: Barter with Piglin if we have gold ingots
const ingots = lib.count('gold_ingot');
if (ingots > 0 && piglins.length > 0) {
  const piglin = piglins[0];
  console.log(`Bartering with Piglin at ${lib.fmt(piglin.position)}...`);
  const gold = bot.inventory.items().find(i => i.name === 'gold_ingot');
  if (gold) {
    bot.chat(`Beta: Tossing gold ingot to Piglin for Milestone 9 bartering!`);
    await bot.lookAt(piglin.position.offset(0, 1.0, 0), true);
    try {
      await bot.toss(gold.type, null, 1);
      console.log('Tossed! Waiting 7.5s for drop...');
      await sleep(7500);
      await lib.pickup(5.0);
    } catch (e) {}
  }
}

// Step 6: Scan for Endermen
const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && bot.entity.position.distanceTo(e.position) <= 25);
console.log(`Endermen found (${endermen.length}):`, endermen.map(e => `${lib.fmt(e.position)} dist=${bot.entity.position.distanceTo(e.position).toFixed(1)}`).join(', '));

// Ensure golden boots still worn
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) { try { await bot.equip(gb, 'feet'); } catch (e) {} }
}

console.log('=== Program 816 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Ender Pearls in inv:', lib.count('ender_pearl'));
console.log('Gold ingots in inv:', lib.count('gold_ingot'));
console.log('Inventory:', lib.inv());

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  piglins: piglins.length,
  endermen: endermen.length
};
