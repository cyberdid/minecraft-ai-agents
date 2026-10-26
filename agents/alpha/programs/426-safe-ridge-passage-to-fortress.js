// programs/426-safe-ridge-passage-to-fortress.js
console.log('=== Program 426: Safe Nether Ridge Passage to Fortress Advance Hallway ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Gather 32 netherrack blocks right outside bunker for building/bridging
console.log('Gathering netherrack for safe trail paving...');
const netherrackBlocks = bot.findBlocks({
  matching: b => b.name === 'netherrack',
  maxDistance: 8,
  count: 32
});

for (const nb of netherrackBlocks) {
  if (lib.count('netherrack') >= 32 || isCancelled()) break;
  // Don't dig under our own feet
  if (nb.x === Math.floor(bot.entity.position.x) && nb.z === Math.floor(bot.entity.position.z)) continue;
  try {
    await lib.dig(nb.x, nb.y, nb.z);
  } catch (e) {}
}
await lib.pickup(6);
console.log('Netherrack collected:', lib.count('netherrack'));

// Helper to scan and extinguish fire ahead
async function clearFireAhead() {
  const fires = bot.findBlocks({
    matching: b => b.name === 'fire' || b.name === 'soul_fire',
    maxDistance: 8,
    count: 10
  });
  for (const fp of fires) {
    console.log(`Extinguishing fire at ${lib.fmt(fp)}...`);
    try {
      await bot.dig(bot.blockAt(fp));
    } catch (e) {
      try {
        if (lib.count('netherrack') > 0) await lib.place('netherrack', fp.x, fp.y, fp.z);
      } catch (e2) {}
    }
  }
}

// 2. Announce advance
bot.chat('team: Alpha advancing along East Ridge trail to join Delta & Gamma at Fortress advance hallway (44, 65, -133)!');

// 3. Segment 1: Bunker (40, 65, -7) to East Ridge entrance (63, 64, -3)
console.log('Segment 1: Moving to (63, 64, -3)...');
try {
  await lib.goTo(63, 64, -3, 2, { timeoutMs: 20000 });
} catch (e) {
  try { await lib.goToXZ(63, -3); } catch (e2) {}
}
console.log('Reached (63, 64, -3). Pos:', lib.fmt(bot.entity.position));

// 4. Segment 2: (63, 64, -3) to (62, 66, -30)
console.log('Segment 2: Moving along ridge to (62, 66, -30)...');
try {
  await lib.goTo(62, 66, -30, 2, { timeoutMs: 20000 });
} catch (e) {
  try { await lib.goToXZ(62, -30); } catch (e2) {}
}
await clearFireAhead();
console.log('Reached (62, 66, -30). Pos:', lib.fmt(bot.entity.position));

// 5. Segment 3: (62, 66, -30) to (61, 67, -60)
console.log('Segment 3: Moving to (61, 67, -60)...');
try {
  await lib.goTo(61, 67, -60, 2, { timeoutMs: 20000 });
} catch (e) {
  try { await lib.goToXZ(61, -60); } catch (e2) {}
}
await clearFireAhead();
console.log('Reached (61, 67, -60). Pos:', lib.fmt(bot.entity.position));

// 6. Segment 4: Fire zone approach (54, 65, -90)
console.log('Segment 4: Carefully traversing past z=-90 fire zone...');
await clearFireAhead();
try {
  await lib.goTo(54, 65, -90, 2, { timeoutMs: 25000 });
} catch (e) {
  try { await lib.goToXZ(54, -90); } catch (e2) {}
}
await clearFireAhead();
console.log('Past fire zone! Pos:', lib.fmt(bot.entity.position));

// 7. Segment 5: Advance to Fortress Workshop entrance (44, 65, -127)
console.log('Segment 5: Moving to Fortress entrance (44, 65, -127)...');
try {
  await lib.goTo(44, 65, -127, 2, { timeoutMs: 25000 });
} catch (e) {
  try { await lib.goToXZ(44, -127); } catch (e2) {}
}
console.log('At Fortress Workshop entrance! Pos:', lib.fmt(bot.entity.position));

// 8. Segment 6: Enter advance hallway (44, 65, -133)
console.log('Segment 6: Stepping into advance hallway (44, 65, -133)...');
try {
  await lib.goTo(44, 65, -133, 1, { timeoutMs: 15000 });
} catch (e) {
  try { await lib.goToXZ(44, -133); } catch (e2) {}
}

console.log('Alpha reached position:', lib.fmt(bot.entity.position));
console.log('Alpha status:', JSON.stringify(lib.status()));

if (bot.entity.position.distanceTo(new Vec3(44, 65, -133)) < 8) {
  bot.chat(`team: Alpha united with Delta & Gamma at Fortress advance hallway ${lib.fmt(bot.entity.position)}! Netherrack=${lib.count('netherrack')}, HP=${bot.health}. Ready for Blaze Spawner assault at (32, 68, -190)!`);
} else {
  bot.chat(`team: Alpha at ${lib.fmt(bot.entity.position)} along Nether ridge trail. Continuing north to (44, 65, -133)!`);
}
