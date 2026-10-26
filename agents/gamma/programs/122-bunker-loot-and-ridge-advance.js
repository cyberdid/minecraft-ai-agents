// programs/122-bunker-loot-and-ridge-advance.js
console.log('--- BUNKER LOOT & SAFE EAST RIDGE ADVANCE ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Inspect and withdraw from bunker chest at (39, 65, -8)
try {
  const chest = await lib.chestContents(39, 65, -8);
  console.log('Bunker chest contents:', JSON.stringify(chest));
  if (Object.keys(chest).length > 0) {
    await lib.withdraw('all', 39, 65, -8);
    console.log('Withdrew supplies from bunker chest!');
  }
} catch (e) {
  console.log('Chest note:', e.message);
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Tools now:', JSON.stringify(lib.tools()));

// 2. Safe East Ridge Trail to Fortress Workshop (44, 65, -128)
console.log('Moving to Waypoint 1 (50, 65, -35)...');
try {
  await lib.goTo(50, 65, -35, 3, { timeoutMs: 20000 });
} catch (e) {}

console.log('Moving to Waypoint 2 on East Ridge at (63, 65, -66)...');
try {
  await lib.goTo(63, 65, -66, 3, { timeoutMs: 25000 });
  console.log('Safely on East Ridge! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('East Ridge note:', e.message);
}

console.log('Moving to Waypoint 3 on East Ridge at (63, 65, -100)...');
try {
  await lib.goTo(63, 65, -100, 3, { timeoutMs: 25000 });
} catch (e) {}

console.log('Moving to Fortress Workshop doorway (44, 65, -128)...');
try {
  await lib.goTo(44, 65, -128, 1, { timeoutMs: 30000 });
  console.log('ARRIVED AT FORTRESS WORKSHOP!');
} catch (e) {
  console.log('Workshop door reach note:', e.message);
}

// Move to Delta & Alpha in advance hallway (44, 65, -133)
console.log('Joining Delta & Alpha at (44, 65, -133)...');
try {
  await lib.goTo(44, 65, -133, 1, { timeoutMs: 15000 });
  console.log('UNITED AT ADVANCE HALLWAY!');
} catch (e) {}

// Report teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}m`);
  }
}

bot.chat(`gamma reached Fortress advance hallway ${lib.fmt(bot.entity.position)}! United with Delta & Alpha for Blaze Spawner assault.`);
console.log('Final pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
