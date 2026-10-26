// programs/466-field-craft-tools-and-portal.js
console.log('=== Program 466: Field Craft Tools & Enter Nether ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Dig 1 accessible log block nearby
const logBlock = bot.findBlock({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 16
});

if (logBlock) {
  console.log(`Digging log at ${lib.fmt(logBlock.position)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalLookAtBlock(logBlock.position, bot.world));
    await bot.dig(logBlock);
    await sleep(400);
    await lib.pickup(4);
  } catch (err) {
    console.log('Log dig note:', err.message);
  }
}

// 2. Craft planks
const logItems = bot.inventory.items().filter(i => i.name.endsWith('_log'));
for (const l of logItems) {
  try {
    await lib.craft(l.name.replace('_log', '_planks'), l.count * 4);
  } catch (e) {}
}
console.log('Planks count:', lib.count('*_planks'));

// 3. Craft crafting table if we don't have one and none nearby
let tableBlock = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 16 });
if (!tableBlock && lib.count('crafting_table') === 0 && lib.count('*_planks') >= 4) {
  try {
    await lib.craft('crafting_table', 1);
    console.log('Crafted crafting table!');
  } catch (e) {}
}

// 4. Craft wooden pickaxe
if (lib.count('*_pickaxe') === 0) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  try {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Crafted wooden_pickaxe!');
  } catch (e) {
    console.log('Craft wooden pickaxe note:', e.message);
  }
}

// 5. Mine 3 stone with wooden pickaxe
if (lib.count('cobblestone') < 3 && lib.count('*_pickaxe') > 0) {
  const stoneBlocks = bot.findBlocks({
    matching: mcData.blocksByName.stone.id,
    maxDistance: 12,
    count: 3
  });
  console.log(`Found ${stoneBlocks.length} stone blocks in reach`);
  const woodPick = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
  if (woodPick) await bot.equip(woodPick, 'hand');
  
  for (const sp of stoneBlocks) {
    try {
      const b = bot.blockAt(sp);
      if (!b) continue;
      await bot.pathfinder.goto(new goals.GoalLookAtBlock(sp, bot.world));
      await bot.dig(b);
      await lib.pickup(3);
    } catch (e) {}
  }
}

// 6. Craft stone pickaxe
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone_pickaxe!');
  } catch (e) {}
}

// 7. Mine 16 cobblestone with stone pickaxe
if (lib.count('stone_pickaxe') > 0) {
  const pick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
  if (pick) await bot.equip(pick, 'hand');
  const needCobble = Math.max(0, 16 - lib.count('cobblestone'));
  if (needCobble > 0) {
    const stones = bot.findBlocks({
      matching: mcData.blocksByName.stone.id,
      maxDistance: 16,
      count: needCobble
    });
    for (const sp of stones) {
      if (lib.count('cobblestone') >= 16) break;
      try {
        const b = bot.blockAt(sp);
        if (!b) continue;
        await bot.pathfinder.goto(new goals.GoalLookAtBlock(sp, bot.world));
        await bot.dig(b);
        await lib.pickup(3);
      } catch (e) {}
    }
  }

  // 8. Craft stone sword
  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
    if (lib.count('stick') < 1) await lib.craft('stick', 4);
    try {
      await lib.craft('stone_sword', 1);
      console.log('Crafted stone_sword!');
    } catch (e) {}
  }
}

await lib.equipWeapon();
console.log('Alpha field inventory:', JSON.stringify(lib.inv()));
console.log('Alpha tools:', JSON.stringify(lib.tools()));

// 9. Walk to Nether portal at (299, 73, -54)
console.log('Moving to Nether portal at (299, 73, -54)...');
try {
  await lib.goTo(299, 72, -53, 1, { timeoutMs: 25000 });
} catch (e) {
  try { await lib.goToXZ(299, -54); } catch (e2) {}
}

// Step into portal block
console.log('Stepping into portal frame...');
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

// 10. Wait for dimension transit (stationary)
console.log('Waiting stationary inside portal for dimension transit...');
for (let wait = 0; wait < 20; wait++) {
  if (bot.game.dimension === 'the_nether') break;
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension);
console.log('Alpha pos:', lib.fmt(bot.entity.position));

bot.chat(`team: Alpha ready! Dimension: ${bot.game.dimension}, Tools: ${JSON.stringify(lib.tools())}, Cobble: ${lib.count('cobblestone')}. Joining Nether expedition!`);
