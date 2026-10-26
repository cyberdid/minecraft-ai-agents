// programs/217-prep-and-descend-obsidian.js
console.log('=== Program 217: Prep & Descend to y=-54 for Obsidian ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Withdraw cooked mutton from chest if available
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  if (contents.cooked_mutton > 0) {
    await lib.withdraw({ cooked_mutton: contents.cooked_mutton }, chestPos.x, chestPos.y, chestPos.z);
    console.log(`Withdrew cooked_mutton x${contents.cooked_mutton}`);
  }
} catch (e) {
  console.log('Withdraw food note:', e.message);
}

// 2. Craft sticks and torches
try {
  if (lib.count('stick') < 4 && lib.count('birch_planks') >= 2) {
    await lib.craft('stick', 4);
  }
  if (lib.count('coal') > 0 && lib.count('stick') >= lib.count('coal')) {
    await lib.craft('torch', lib.count('coal') * 4);
  }
  // Ensure we have at least 2-3 stone pickaxes for digging stairs
  if (lib.count('stone_pickaxe') < 3 && lib.count('cobblestone') >= 6) {
    if (lib.count('stick') < 4) await lib.craft('stick', 4);
    await lib.craft('stone_pickaxe', 2);
  }
} catch (e) {
  console.log('Craft prep note:', e.message);
}

console.log('Inventory ready:', JSON.stringify(lib.inv()));
bot.chat('beta: Prepped with food, torches, and diamond pickaxe. Heading to staircase at (345, 65, -40) -> descending to y=-54 for 10 obsidian!');

// 3. Exit base
console.log('Exiting base door...');
try {
  if (typeof passDoorOut === 'function') await passDoorOut();
  else await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door exit note:', e.message);
}

// 4. Walk to staircase entrance at (345, 65, -40)
console.log('Walking to staircase entrance (345, 65, -40)...');
try {
  await lib.goTo(345, 65, -40, 2, { timeoutMs: 30000 });
  console.log('At staircase entrance! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Walk to stairs note:', e.message);
}

// 5. Follow existing staircase down to y=-1
console.log('Following existing stairs down towards y=-1...');
const downStages = [
  { x: 335, y: 50, z: -48 },
  { x: 325, y: 32, z: -55 },
  { x: 315, y: 15, z: -60 },
  { x: 303, y: -1, z: -70 }
];

for (const st of downStages) {
  if (isCancelled()) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(st.x, st.y, st.z, 2));
    console.log(`Passed down-stage at y=${bot.entity.position.y.toFixed(0)}`);
  } catch (err) {
    try {
      await lib.goTo(st.x, st.y, st.z, 2, { timeoutMs: 15000 });
    } catch (e2) {}
  }
}

console.log('At bottom of existing staircase! Pos:', lib.fmt(bot.entity.position));

// 6. Descend from current depth down to y=-54
if (bot.entity.position.y > -50) {
  console.log('Beginning lib.descend to y=-54...');
  try {
    await lib.descend(-54, { torchEvery: 8 });
    console.log('Reached target depth! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Descend stopped/note:', e.message, 'Pos:', lib.fmt(bot.entity.position));
  }
}

// 7. Check for lava sources at depth
console.log('Scanning for lava at depth...');
const deepLava = bot.findBlocks({ matching: b => b.name === 'lava' && b.metadata === 0, maxDistance: 48, count: 50 });
console.log(`Found ${deepLava.length} lava source blocks within 48 blocks.`);

// 8. Make obsidian
if (deepLava.length > 0 && lib.count('obsidian') < 10) {
  console.log('Found lava! Running lib.makeObsidian(10)...');
  try {
    const res = await lib.makeObsidian(10);
    console.log('makeObsidian result:', JSON.stringify(res));
  } catch (err) {
    console.log('makeObsidian error:', err.message);
  }
}

console.log(`Total obsidian in inventory: ${lib.count('obsidian')}`);
bot.chat(`beta: Depth reached: y=${bot.entity.position.y.toFixed(0)}. Obsidian: ${lib.count('obsidian')}/10. Lava sources nearby: ${deepLava.length}.`);

console.log('Program 217 finished. Status:', JSON.stringify(lib.status()));
