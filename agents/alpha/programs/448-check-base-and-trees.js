// programs/448-check-base-and-trees.js
console.log('=== Program 448: Check Base Chest & Forest ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Move to base door / inside base
console.log('Walking to base door at (294, 72, -53)...');
await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));

console.log('Entering base...');
try {
  await passDoorIn();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 2. Check base chest at (293, 72, -57)
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(contents));
  const toWithdraw = {};
  for (const item of ['stone_pickaxe', 'iron_pickaxe', 'stone_sword', 'iron_sword', 'shield', 'cobblestone', 'bread', 'cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'coal', 'charcoal', 'iron_ingot', 'raw_iron']) {
    if (contents[item] > 0) toWithdraw[item] = contents[item];
  }
  if (Object.keys(toWithdraw).length > 0) {
    console.log('Withdrawing from chest:', JSON.stringify(toWithdraw));
    await lib.withdraw(toWithdraw, 293, 72, -57);
  }
} catch (err) {
  console.log('Chest error:', err.message);
}

console.log('Alpha inventory after chest check:', JSON.stringify(lib.inv()));

// 3. If we don't have a pickaxe, find trees
if (lib.count('*_pickaxe') === 0) {
  console.log('Finding logs within 64 blocks...');
  const logs = lib.find('*_log', { maxDistance: 64, count: 10 });
  console.log(`Found ${logs.length} logs:`, logs.map(b => `${b.name} at ${lib.fmt(b.position)}`).join(', '));
  
  if (logs.length > 0) {
    // Step out of base
    await passDoorOut();
    const nearestLog = logs[0];
    console.log(`Moving to nearest log at ${lib.fmt(nearestLog.position)}...`);
    await bot.pathfinder.goto(new goals.GoalLookAtBlock(nearestLog.position, bot.world));
    await bot.dig(nearestLog);
    await lib.pickup(4);
    
    // Dig one more log if available
    const secondLog = bot.findBlock({ matching: b => b.name.endsWith('_log'), maxDistance: 5 });
    if (secondLog) {
      await bot.dig(secondLog);
      await lib.pickup(4);
    }
    
    // Craft planks
    const logsHeld = bot.inventory.items().filter(i => i.name.endsWith('_log'));
    for (const l of logsHeld) {
      await lib.craft(l.name.replace('_log', '_planks'), l.count * 4);
    }
    
    // Return to base crafting table
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
    await passDoorIn();
    
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('wooden_pickaxe', 1);
    console.log('Wooden pickaxe crafted!');
  }
}

// 4. If we have wooden pickaxe and need cobblestone
if (lib.count('*_pickaxe') > 0 && lib.count('cobblestone') < 20) {
  console.log('Mining stone with pickaxe...');
  // Step outside base to mine stone
  await passDoorOut();
  const stoneBlocks = bot.findBlocks({
    matching: mcData.blocksByName.stone.id,
    maxDistance: 16,
    count: 25
  });
  console.log(`Found ${stoneBlocks.length} stone blocks`);
  for (const sp of stoneBlocks) {
    if (lib.count('cobblestone') >= 20) break;
    try {
      const b = bot.blockAt(sp);
      if (!b || b.name !== 'stone') continue;
      await bot.pathfinder.goto(new goals.GoalLookAtBlock(sp, bot.world));
      const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
      if (pick) await bot.equip(pick, 'hand');
      await bot.dig(b);
      await lib.pickup(4);
    } catch (e) {}
  }
  
  // Return to base crafting table
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
  await passDoorIn();
  
  // Craft stone pickaxe and sword
  if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('stone_pickaxe', 1);
  }
  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
    if (lib.count('stick') < 1) await lib.craft('stick', 4);
    await lib.craft('stone_sword', 1);
  }
}

await lib.equipWeapon();
await lib.equipArmor();

console.log('SUMMARY:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha ready! Tools: ${JSON.stringify(lib.tools())}, Cobble: ${lib.count('cobblestone')}`);
