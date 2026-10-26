// programs/127-inspect-and-arm.js
console.log('--- INSPECT SURROUNDINGS AND ARM ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Craft crafting_table in 2x2 grid
if (lib.count('crafting_table') === 0 && lib.count('*_planks') >= 4) {
  console.log('Crafting crafting_table...');
  await lib.craft('crafting_table', 1);
  console.log('Crafted table. Inv:', JSON.stringify(lib.inv()));
}

// 2. Find a free spot and place the crafting table right here
const p = bot.entity.position.floored();
console.log('Placing crafting table near', lib.fmt(p));
let placedSpot = null;
const candidateSpots = [
  p.offset(1, 0, 0), p.offset(-1, 0, 0), p.offset(0, 0, 1), p.offset(0, 0, -1),
  p.offset(1, -1, 0), p.offset(-1, -1, 0), p.offset(0, -1, 1), p.offset(0, -1, -1)
];

for (const spot of candidateSpots) {
  const b = bot.blockAt(spot);
  const below = bot.blockAt(spot.offset(0, -1, 0));
  if (b && (b.name === 'air' || b.name === 'grass') && below && below.boundingBox === 'block') {
    try {
      await lib.place('crafting_table', spot.x, spot.y, spot.z);
      placedSpot = spot;
      console.log('Placed crafting table at', lib.fmt(spot));
      break;
    } catch (e) {
      console.log('Place error at', lib.fmt(spot), e.message);
    }
  }
}

// 3. Craft wooden pickaxe
console.log('Crafting wooden_pickaxe...');
await lib.craft('wooden_pickaxe', 1);
console.log('Tools now:', JSON.stringify(lib.tools()));

// 4. Mine 16 stone right around us
console.log('Mining stone...');
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Look for stone/cobblestone/granite/diorite within 4 blocks
const stoneBlocks = bot.findBlocks({
  matching: b => ['stone', 'cobblestone', 'granite', 'diorite', 'andesite'].includes(b.name),
  maxDistance: 6,
  count: 20
});

console.log(`Found ${stoneBlocks.length} stone blocks nearby`);
for (const sb of stoneBlocks) {
  if (lib.count('cobblestone') >= 16) break;
  try {
    await lib.dig(sb.x, sb.y, sb.z);
    await sleep(100);
    await lib.pickup(4);
  } catch (e) {
    console.log('Dig error at', lib.fmt(sb), e.message);
  }
}

console.log('Cobblestone mined:', lib.count('cobblestone'));

// 5. Craft stone tools
if (lib.count('cobblestone') >= 2) await lib.craft('stone_sword', 1);
if (lib.count('cobblestone') >= 3) await lib.craft('stone_pickaxe', 1);
if (lib.count('cobblestone') >= 3) await lib.craft('stone_axe', 1);

// Pick up the crafting table before leaving!
if (placedSpot) {
  try {
    console.log('Recovering crafting table at', lib.fmt(placedSpot));
    await lib.dig(placedSpot.x, placedSpot.y, placedSpot.z);
    await sleep(200);
    await lib.pickup(4);
  } catch (e) {
    console.log('Recover table error:', e.message);
  }
}

console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Tools:', JSON.stringify(lib.tools()));
