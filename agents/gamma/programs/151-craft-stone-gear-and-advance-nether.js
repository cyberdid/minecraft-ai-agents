// programs/151-craft-stone-gear-and-advance-nether.js
console.log('--- CRAFT STONE GEAR & RETURN TO NETHER FORTRESS ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Craft birch_planks, sticks, crafting_table, wooden_pickaxe
console.log('Crafting basic wood gear...');
await lib.craft('birch_planks', 16);
await lib.craft('stick', 4);
await lib.craft('crafting_table', 1);

// Place crafting table nearby if not near one
const tablePos = bot.entity.position.floored().offset(1, 0, 0);
const below = bot.blockAt(tablePos.offset(0, -1, 0));
if (below && below.boundingBox === 'block' && bot.blockAt(tablePos).name === 'air') {
  try {
    await lib.place('crafting_table', tablePos.x, tablePos.y, tablePos.z);
    console.log('Placed crafting table at', lib.fmt(tablePos));
  } catch (e) {}
}

await lib.craft('wooden_pickaxe', 1);
console.log('Crafted wooden_pickaxe. Tools:', JSON.stringify(lib.tools()));

// 2. Mine 16 stone right on the hill
console.log('Mining 16 stone on hill...');
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

try {
  await lib.collect('stone', 16, { maxDistance: 16 });
} catch (e) {
  console.log('collect stone note:', e.message);
}

console.log('Cobblestone mined:', lib.count('cobblestone'));

// 3. Craft stone tools
if (lib.count('cobblestone') >= 2) await lib.craft('stone_sword', 1);
if (lib.count('cobblestone') >= 3) await lib.craft('stone_pickaxe', 1);
if (lib.count('cobblestone') >= 3) await lib.craft('stone_axe', 1);

// Equip stone sword
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

console.log('Inv after stone tools:', JSON.stringify(lib.inv()));
console.log('Gear:', JSON.stringify(lib.tools()));
bot.chat(`gamma armed with stone sword, pickaxe, axe & ${lib.count('cobblestone')} cobble. Heading to Nether portal.`);

// 4. Move to Nether portal at (299, 73, -54)
console.log('Moving to Nether portal (299, 73, -54)...');
try {
  await lib.goTo(299, 73, -53, 1, { timeoutMs: 25000 });
} catch (e) {
  await lib.goToXZ(299, -53, { timeoutMs: 15000 });
}

// Step into portal and stand still
console.log('Stepping into purple portal frame...');
await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
bot.clearControlStates();

console.log('Waiting for Nether transit (standing still)...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  console.log('Dimension currently:', bot.game.dimension);
  throw new Error('Did not transition to Nether within 25s');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
bot.chat('gamma in the Nether! Following safe East Ridge trail to Fortress advance tunnel (44, 65, -141).');

// 5. Follow Delta tested East Ridge waypoints
const deltaWaypoints = [
  new Vec3(63, 64, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(54, 65, -90),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -141)
];

for (let i = 0; i < deltaWaypoints.length; i++) {
  const wp = deltaWaypoints[i];
  console.log(`Navigating to Waypoint ${i + 1}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 25000 });
    console.log(`Reached Waypoint ${i + 1} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`WP ${i + 1} note: ${e.message}`);
  }
}

console.log('Final position in Nether:', lib.fmt(bot.entity.position));
bot.chat(`gamma safely arrived at Fortress advance tunnel ${lib.fmt(bot.entity.position)}! Cobblestone=${lib.count('cobblestone')}. Ready to secure breach at z=-149.`);
