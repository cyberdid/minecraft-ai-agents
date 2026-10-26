// programs/078-rush-fortress-reinforce-alpha.js
console.log('--- REINFORCING ALPHA AT FORTRESS BRIDGEHEAD ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

bot.chat('Alpha hold on! Gamma rushing to (45, 65, -130) with 120+ stone blocks and full 20/20 HP!');

// 1. Waypoint 1: (50, 65, -37)
console.log('Moving to Waypoint 1 (50, 65, -37)...');
try {
  await lib.goTo(50, 65, -37, 3, { timeoutMs: 20000 });
} catch (e) {
  console.log('WP1 note:', e.message);
}

// 2. Waypoint 2: (56, 64, -66)
console.log('Moving to Waypoint 2 (56, 64, -66)...');
try {
  await lib.goTo(56, 64, -66, 3, { timeoutMs: 20000 });
} catch (e) {
  console.log('WP2 note:', e.message);
}

// 3. Waypoint 3: Fortress Entrance (51, 65, -116)
console.log('Moving to Fortress entrance (51, 65, -116)...');
try {
  await lib.goTo(51, 65, -116, 3, { timeoutMs: 25000 });
} catch (e) {
  console.log('Fortress entrance note:', e.message);
}

// 4. Reach Alpha at Bridgehead (45, 65, -130)
console.log('Reaching Alpha at Bridgehead (45, 65, -130)...');
try {
  await lib.goTo(45, 65, -130, 2, { timeoutMs: 25000 });
  console.log('REACHED BRIDGEHEAD! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Bridgehead reach note:', e.message);
}

// 5. Pickup all drops
console.log('Picking up drops around bridgehead...');
await lib.pickup(10);

// 6. Check for hostiles and defend
await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');
const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze' && e.position && e.position.distanceTo(bot.entity.position) < 12);
if (blazes.length > 0) {
  console.log(`Defending against ${blazes.length} blazes!`);
  const target = blazes[0];
  while (target.isValid && target.position.distanceTo(bot.entity.position) < 10 && !isCancelled()) {
    await bot.lookAt(target.position.offset(0, target.height * 0.5, 0));
    bot.attack(target);
    await sleep(650);
  }
  await lib.pickup(8);
}

// 7. Fortify exposed edges with granite/diorite blocks
console.log('Fortifying bridgehead perimeter...');
const curPos = bot.entity.position.floored();
// Place protective blocks on edges if air
const edges = [
  curPos.offset(1, 0, 0),
  curPos.offset(-1, 0, 0),
  curPos.offset(0, 0, 1),
  curPos.offset(0, 0, -1),
  curPos.offset(1, 1, 0),
  curPos.offset(-1, 1, 0)
];

const buildMaterial = lib.count('granite') > 0 ? 'granite' : 'diorite';
for (const ed of edges) {
  const b = bot.blockAt(ed);
  const below = bot.blockAt(ed.offset(0, -1, 0));
  if (b && (b.name === 'air' || b.name === 'cave_air') && below && below.boundingBox === 'block' && below.name !== 'nether_portal') {
    try {
      await lib.place(buildMaterial, ed.x, ed.y, ed.z);
      console.log(`Placed protective ${buildMaterial} at ${lib.fmt(ed)}`);
    } catch (e) {}
  }
}

// Check for blaze rods
const rods = lib.count('blaze_rod');
console.log(`Blaze rods in inventory: ${rods}`);
console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`gamma at Fortress bridgehead ${lib.fmt(bot.entity.position)}! Health: ${bot.health}, Blaze rods: ${rods}`);
