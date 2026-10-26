// programs/423-advance-along-east-ridge.js
console.log('=== Program 423: Advance Along East Ridge to Fortress Bunker ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food, 'Cobble:', lib.count('cobblestone'));

// 1. Inspect bunker at (40, 65, -7) for chest supplies
const bunkerChests = bot.findBlocks({ matching: mcData.blocksByName.chest?.id, maxDistance: 8, count: 2 });
for (const cp of bunkerChests) {
  try {
    const contents = await lib.chestContents(cp.x, cp.y, cp.z);
    console.log(`Bunker chest at ${lib.fmt(cp)}:`, JSON.stringify(contents));
    const toTake = {};
    for (const item of ['cooked_beef', 'bread', 'apple', 'cobblestone', 'iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots', 'golden_boots', 'shield']) {
      if (contents[item] > 0) toTake[item] = contents[item];
    }
    if (Object.keys(toTake).length > 0) {
      await lib.withdraw(toTake, cp.x, cp.y, cp.z);
      await lib.equipArmor();
    }
  } catch (e) {}
}

// 2. Chat with team
bot.chat('team: Alpha advancing along East Ridge Trail to join Delta & Gamma at Fortress Bunker (44, 65, -133)!');

// 3. Stage 1: Move from bunker (40, 65, -7) to East Ridge entrance (63, 64, -3)
console.log('Navigating to Waypoint 1: East Ridge entrance (63, 64, -3)...');
try {
  await lib.goTo(63, 64, -3, 2, { timeoutMs: 25000 });
  console.log('Waypoint 1 reached at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Waypoint 1 note:', e.message);
  try { await lib.goToXZ(63, -3); } catch (e2) {}
}

// 4. Stage 2: Move along ridge to Waypoint 2 (61, 66, -45)
console.log('Navigating to Waypoint 2: Ridge trail (61, 66, -45)...');
try {
  await lib.goTo(61, 66, -45, 2, { timeoutMs: 30000 });
  console.log('Waypoint 2 reached at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Waypoint 2 note:', e.message);
  try { await lib.goToXZ(61, -45); } catch (e2) {}
}

// Check hostiles around Ghast sector
const hostiles = lib.hostiles(32);
console.log(`Hostiles detected: ${hostiles.length}`);
for (const h of hostiles) console.log(`- ${h.name} at ${lib.fmt(h.pos)} (dist: ${h.dist.toFixed(1)}m)`);

// 5. Stage 3: Advance past z=-65 towards Fortress bridgehead (45, 65, -116)
console.log('Navigating to Waypoint 3: Fortress bridgehead (45, 65, -116)...');
try {
  await lib.goTo(45, 65, -116, 2, { timeoutMs: 35000 });
  console.log('Waypoint 3 reached at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Waypoint 3 note:', e.message);
  try { await lib.goToXZ(45, -116); } catch (e2) {}
}

// 6. Stage 4: Enter Fortress Workshop (44, 65, -127) and reach advance hallway (44, 65, -133)
console.log('Entering Fortress advance hallway (44, 65, -133)...');
try {
  await lib.goTo(44, 65, -133, 1, { timeoutMs: 20000 });
  console.log('*** UNITED WITH TEAM AT FORTRESS ADVANCE HALLWAY! ***');
} catch (e) {
  console.log('Hallway entry note:', e.message);
  try { await lib.goTo(44, 65, -127, 2, { timeoutMs: 15000 }); } catch (e2) {}
}

console.log('Alpha final position:', lib.fmt(bot.entity.position));
console.log('Alpha status:', JSON.stringify(lib.status()));

// Report arrival in chat
if (bot.entity.position.distanceTo(new Vec3(44, 65, -133)) < 10) {
  bot.chat(`team: Alpha united with Delta & Gamma at Fortress advance hallway ${lib.fmt(bot.entity.position)}! HP=${bot.health}, Food=${bot.food}, Cobble=${lib.count('cobblestone')}. Ready to bridge & breach Blaze Spawner!`);
} else {
  bot.chat(`team: Alpha at ${lib.fmt(bot.entity.position)} along Nether ridge trail. Continuing north to (44, 65, -133)!`);
}
