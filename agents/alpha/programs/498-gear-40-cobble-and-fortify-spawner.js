// programs/498-gear-40-cobble-and-fortify-spawner.js
console.log('=== Program 498: Mine 40 Cobble & Fortify Spawner Walkway ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Step out of base
console.log('Exiting base door...');
try {
  await passDoorOut();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// 2. Walk to birch tree & cliff at (314, 71, -55)
console.log('Walking to birch tree & cliff at (314, 71, -55)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(313, 71, -55, 1));
} catch (e) {
  try { await lib.goToXZ(314, -55); } catch (e2) {}
}

// 3. Dig 2 birch logs
for (const y of [71, 72]) {
  const logBlock = bot.blockAt(new Vec3(315, y, -55));
  if (logBlock && logBlock.name.endsWith('_log')) {
    try {
      await bot.pathfinder.goto(new goals.GoalLookAtBlock(logBlock.position, bot.world));
      await bot.dig(logBlock);
      await sleep(300);
      await lib.pickup(4);
    } catch (e) {}
  }
}

// 4. Craft planks & sticks
const logs = bot.inventory.items().filter(i => i.name.endsWith('_log'));
for (const l of logs) {
  try { await lib.craft(l.name.replace('_log', '_planks'), l.count * 4); } catch (e) {}
}
if (lib.count('stick') < 4 && lib.count('*_planks') >= 2) {
  try { await lib.craft('stick', 4); } catch (e) {}
}

// 5. Craft wooden pickaxe
if (lib.count('*_pickaxe') === 0 && lib.count('*_planks') >= 3 && lib.count('stick') >= 2) {
  try {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Crafted wooden_pickaxe!');
  } catch (err) {}
}

// 6. Mine stone for stone pickaxe & 40 cobblestone
if (lib.count('*_pickaxe') > 0) {
  const stoneBlocks = bot.findBlocks({
    matching: mcData.blocksByName.stone.id,
    maxDistance: 12,
    count: 3
  });
  for (const sp of stoneBlocks) {
    if (lib.count('cobblestone') >= 3) break;
    try {
      const b = bot.blockAt(sp);
      if (!b) continue;
      await bot.pathfinder.goto(new goals.GoalLookAtBlock(sp, bot.world));
      const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
      if (pick) await bot.equip(pick, 'hand');
      await bot.dig(b);
      await lib.pickup(3);
    } catch (e) {}
  }

  // Craft stone pickaxe
  if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
    if (lib.count('stick') < 2) try { await lib.craft('stick', 4); } catch (e) {}
    try {
      await lib.craft('stone_pickaxe', 1);
      console.log('Crafted stone_pickaxe!');
    } catch (e) {}
  }

  // Mine 40 cobblestone with stone pickaxe
  if (lib.count('stone_pickaxe') > 0) {
    const pick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
    if (pick) await bot.equip(pick, 'hand');
    const cliffStones = bot.findBlocks({
      matching: mcData.blocksByName.stone.id,
      maxDistance: 16,
      count: 45
    });
    console.log(`Found ${cliffStones.length} stone blocks in cliff`);
    for (const sp of cliffStones) {
      if (lib.count('cobblestone') >= 36) break;
      try {
        const b = bot.blockAt(sp);
        if (!b) continue;
        await bot.pathfinder.goto(new goals.GoalLookAtBlock(sp, bot.world));
        await bot.dig(b);
        await lib.pickup(3);
      } catch (e) {}
    }
  }

  // Craft stone sword
  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
    if (lib.count('stick') < 1) try { await lib.craft('stick', 4); } catch (e) {}
    try {
      await lib.craft('stone_sword', 1);
      console.log('Crafted stone_sword!');
    } catch (e) {}
  }
}

await lib.equipWeapon();
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

// 7. Move to Nether portal at (299, 73, -54)
console.log('Moving into Nether portal at (299, 73, -54)...');
try {
  await lib.goTo(299, 72, -53, 1, { timeoutMs: 15000 });
} catch (e) {
  try { await lib.goToXZ(299, -54); } catch (e2) {}
}

try {
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(800);
  bot.setControlState('jump', false);
  await sleep(400);
  bot.setControlState('forward', false);
}

bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 8. Wait for dimension transit
console.log('Waiting stationary inside portal for dimension transit...');
for (let wait = 0; wait < 25; wait++) {
  if (bot.game.dimension === 'the_nether') {
    console.log('*** TRANSIT SUCCESSFUL! ALPHA IS IN THE NETHER! ***');
    break;
  }
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

bot.chat(`team: Alpha armed (stone_sword & pickaxe) with ${lib.count('cobblestone')} cobblestone! Transited Nether at ${lib.fmt(bot.entity.position)}. Sprinting to build spawner battlements box!`);
