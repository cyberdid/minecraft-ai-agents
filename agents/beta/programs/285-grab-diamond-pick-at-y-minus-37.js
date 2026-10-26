// programs/285-grab-diamond-pick-at-y-minus-37.js
console.log('=== Step 42: Final 20 blocks down stairs to (303, -37, -110) ===');
console.log('Current beta pos:', lib.fmt(bot.entity.position));

// 1. Move down the remaining stairs to (303, -37, -110)
try {
  await lib.goTo(303, -37, -110, 2, { timeoutMs: 20000, dig: true });
  console.log('Reached death spot! Beta at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Final stretch note:', e.message);
}

// 2. Clear any hostile if nearby
const h = lib.hostiles(8);
if (h.length > 0) {
  console.log(`Hostile mobs nearby:`, h.map(m => m.name));
  try {
    await lib.fight(8, 10);
  } catch (e) {
    console.log('Fight note:', e.message);
  }
}

// 3. Pickup all drops
console.log('Sweeping for dropped items...');
await lib.pickup(16);

const drops = Object.values(bot.entities).filter(e => 
  e && e.name === 'item' && e.position && e.position.distanceTo(bot.entity.position) < 16
);
console.log(`Visible item entities near spot: ${drops.length}`);
for (const it of drops) {
  try {
    await lib.goTo(it.position.x, it.position.y, it.position.z, 1, { timeoutMs: 5000, dig: true });
  } catch (e) {}
}
await lib.pickup(8);

console.log('Beta inv now:', JSON.stringify(lib.inv()));
console.log('Beta tools now:', JSON.stringify(lib.tools()));
const gotDiamondPick = lib.count('diamond_pickaxe') > 0;
console.log(`Recovered diamond_pickaxe: ${gotDiamondPick}`);

// 4. Ascend back up towards surface
console.log('Ascending back up the stairs...');
try {
  await lib.goTo(345, 65, -40, 2, { timeoutMs: 25000, dig: true });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {
  console.log('Ascent note:', e.message);
}

bot.chat(`beta: Deep recovery result: diamond_pickaxe=${lib.count('diamond_pickaxe')}, water_bucket=${lib.count('water_bucket')}. Current pos: ${lib.fmt(bot.entity.position)}.`);
