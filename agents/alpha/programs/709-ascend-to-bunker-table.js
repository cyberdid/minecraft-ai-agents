// programs/709-ascend-to-bunker-table.js
console.log('=== Program 709: Ascend to Bunker Crafting Table ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain active shield
bot.activateItem(true);
globalThis.configureFireAvoidance();

// Configure movements for smooth ascent
const netherMoves = new Movements(bot, mcData);
const avoidBlocks = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id, mcData.blocksByName.lava?.id].filter(Boolean);
for (const id of avoidBlocks) netherMoves.blocksToAvoid.add(id);
netherMoves.canDig = true;
netherMoves.maxDropDown = 3;
netherMoves.allowParkour = true;
bot.pathfinder.setMovements(netherMoves);

// 2. Ascend slope to bunker table
const ASCENT_WAYPOINTS = [
  { x: 50, y: 53, z: 1 },
  { x: 48, y: 56, z: -1 },
  { x: 45, y: 58, z: -3 },
  { x: 42, y: 61, z: -6 }
];

for (let i = 0; i < ASCENT_WAYPOINTS.length; i++) {
  if (checkCancelled()) break;
  const wp = ASCENT_WAYPOINTS[i];
  console.log(`Ascending to waypoint ${i + 1}/${ASCENT_WAYPOINTS.length} (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.2));
  } catch (e) {
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 1.5, { dig: true, timeoutMs: 5000 });
    } catch (e2) {}
  }
}

console.log('Alpha reached bunker area at:', lib.fmt(bot.entity.position));

// 3. Find Crafting Table
const table = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 8 });
console.log('Crafting table found at:', table ? lib.fmt(table.position) : 'none');
if (table) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(table.position.x, table.position.y, table.position.z, 1.2));
  } catch (e) {}
}

// 4. Pickup any drops on bunker floor
await lib.pickup(5.0);

// 5. Check nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (${dist}m), held: ${p.entity.heldItem?.name}`);
  }
}

// 6. Check gold and craft if possible
const nuggets = lib.count('gold_nugget');
let ingots = lib.count('gold_ingot');
console.log(`Alpha holds: ${ingots} gold ingots, ${nuggets} gold nuggets`);

if (nuggets >= 9) {
  const toCraft = Math.floor(nuggets / 9);
  try {
    await lib.craft('gold_ingot', toCraft);
    console.log(`Crafted ${toCraft} gold ingots! Total ingots: ${lib.count('gold_ingot')}`);
  } catch (e) {}
}

ingots = lib.count('gold_ingot');
let hasBoots = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;

if (ingots >= 4 && !hasBoots) {
  try {
    await lib.craft('golden_boots', 1);
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) await bot.equip(gb, 'feet');
    bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! Piglin neutrality ACTIVE!');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

hasBoots = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;
console.log('Golden boots status:', hasBoots ? 'EQUIPPED' : 'PENDING');

bot.chat(`alpha: Ascended to bunker table (42, 60, -6). Boots: ${hasBoots ? 'YES' : 'NO'}, Ingots: ${lib.count('gold_ingot')}, Pearls: ${lib.count('ender_pearl')}/12`);
console.log('=== Program 709 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());
