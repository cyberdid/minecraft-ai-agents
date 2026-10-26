// programs/434-sprint-along-ridge-to-hallway.js
console.log('=== Program 434: Sprint Along East Ridge to Fortress Hallway ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food, 'Netherrack:', lib.count('netherrack'));

bot.chat('team: Alpha at (61, 68, -3) with 42 netherrack. Moving North along East Ridge to Fortress advance hallway (44, 65, -133)!');

// Helper to extinguish fire ahead
async function clearFireAhead() {
  const fires = bot.findBlocks({
    matching: b => b.name === 'fire' || b.name === 'soul_fire',
    maxDistance: 8,
    count: 8
  });
  for (const fp of fires) {
    try { await bot.dig(bot.blockAt(fp)); } catch (e) {}
  }
}

// 1. Waypoint 1: (62, 66, -30)
console.log('Moving to Waypoint 1: (62, 66, -30)...');
try {
  await lib.goTo(62, 66, -30, 2, { timeoutMs: 20000 });
} catch (e) {
  try { await lib.goToXZ(62, -30); } catch (e2) {}
}
await clearFireAhead();
console.log('At (62, -30):', lib.fmt(bot.entity.position));

// 2. Waypoint 2: (61, 67, -60)
console.log('Moving to Waypoint 2: (61, 67, -60)...');
try {
  await lib.goTo(61, 67, -60, 2, { timeoutMs: 20000 });
} catch (e) {
  try { await lib.goToXZ(61, -60); } catch (e2) {}
}
await clearFireAhead();
console.log('At (61, -60):', lib.fmt(bot.entity.position));

// 3. Waypoint 3: (54, 65, -90)
console.log('Moving to Waypoint 3: (54, 65, -90)...');
try {
  await lib.goTo(54, 65, -90, 2, { timeoutMs: 25000 });
} catch (e) {
  try { await lib.goToXZ(54, -90); } catch (e2) {}
}
await clearFireAhead();
console.log('Past z=-90 fire zone:', lib.fmt(bot.entity.position));

// 4. Waypoint 4: Fortress Workshop entrance (44, 65, -127)
console.log('Moving to Fortress entrance: (44, 65, -127)...');
try {
  await lib.goTo(44, 65, -127, 2, { timeoutMs: 25000 });
} catch (e) {
  try { await lib.goToXZ(44, -127); } catch (e2) {}
}
console.log('At Fortress entrance:', lib.fmt(bot.entity.position));

// 5. Step safely inside advance hallway (44, 65, -133)
console.log('Stepping inside advance hallway (44, 65, -133)...');
try {
  await lib.goTo(44, 65, -133, 1, { timeoutMs: 15000 });
} catch (e) {
  try { await lib.goToXZ(44, -133); } catch (e2) {}
}

console.log('Alpha reached hallway at:', lib.fmt(bot.entity.position));
console.log('Alpha status:', JSON.stringify(lib.status()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));

if (bot.entity.position.distanceTo(new Vec3(44, 65, -133)) < 6) {
  bot.chat(`team: Alpha arrived inside Fortress advance hallway (44, 65, -133)! Netherrack=${lib.count('netherrack')}, HP=${bot.health}. Building roof to block Blaze fireballs!`);
} else {
  bot.chat(`team: Alpha at ${lib.fmt(bot.entity.position)} en route to (44, 65, -133).`);
}
