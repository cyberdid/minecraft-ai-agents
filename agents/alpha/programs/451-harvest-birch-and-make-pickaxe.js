// programs/451-harvest-birch-and-make-pickaxe.js
console.log('=== Program 451: Harvest Birch & Craft Pickaxe ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Step out of base
console.log('Exiting base...');
try {
  await passDoorOut();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// 2. Walk to birch tree at (315, 71, -55)
console.log('Walking towards birch tree at (315, 71, -55)...');
await bot.pathfinder.goto(new goals.GoalNear(313, 71, -55, 2));

// 3. Dig birch logs
for (const y of [71, 72, 73]) {
  const logPos = new Vec3(315, y, -55);
  const block = bot.blockAt(logPos);
  if (block && block.name.endsWith('_log')) {
    console.log(`Digging log at ${lib.fmt(logPos)}...`);
    await bot.pathfinder.goto(new goals.GoalLookAtBlock(logPos, bot.world));
    await bot.dig(block);
    await lib.pickup(4);
  }
}

console.log('Inventory after chopping:', JSON.stringify(lib.inv()));

// 4. Craft planks
const logs = bot.inventory.items().filter(i => i.name.endsWith('_log'));
for (const l of logs) {
  const plankName = l.name.replace('_log', '_planks');
  await lib.craft(plankName, l.count * 4);
}
console.log('Planks count:', lib.count('*_planks'));

// 5. Walk back to base
console.log('Returning to base...');
await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
await passDoorIn();
console.log('Inside base!');

// 6. Craft wooden pickaxe
if (lib.count('*_pickaxe') === 0) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  console.log('Crafting wooden pickaxe at base crafting table...');
  await lib.craft('wooden_pickaxe', 1);
  console.log('Crafted wooden pickaxe!');
}

// 7. Find stone blocks to mine
console.log('Locating stone blocks...');
const stoneBlocks = bot.findBlocks({
  matching: mcData.blocksByName.stone.id,
  maxDistance: 20,
  count: 30
});
console.log(`Found ${stoneBlocks.length} stone blocks`);

// Mine first 3 stone with wooden pickaxe to craft stone pickaxe
if (lib.count('stone_pickaxe') === 0 && stoneBlocks.length >= 3) {
  for (const sp of stoneBlocks.slice(0, 3)) {
    const b = bot.blockAt(sp);
    if (!b || b.name !== 'stone') continue;
    await bot.pathfinder.goto(new goals.GoalLookAtBlock(sp, bot.world));
    const pick = bot.inventory.items().find(i => i.name === 'wooden_pickaxe');
    if (pick) await bot.equip(pick, 'hand');
    await bot.dig(b);
    await lib.pickup(3);
  }
  
  if (lib.count('cobblestone') >= 3) {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe crafted!');
  }
}

// Mine more cobblestone with stone pickaxe up to 20
if (lib.count('stone_pickaxe') > 0) {
  const moreStone = bot.findBlocks({
    matching: mcData.blocksByName.stone.id,
    maxDistance: 20,
    count: 20
  });
  for (const sp of moreStone) {
    if (lib.count('cobblestone') >= 20) break;
    const b = bot.blockAt(sp);
    if (!b || b.name !== 'stone') continue;
    try {
      await bot.pathfinder.goto(new goals.GoalLookAtBlock(sp, bot.world));
      const pick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
      if (pick) await bot.equip(pick, 'hand');
      await bot.dig(b);
      await lib.pickup(3);
    } catch (e) {}
  }
  
  // Craft stone sword
  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
    if (lib.count('stick') < 1) await lib.craft('stick', 4);
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  }
}

await lib.equipWeapon();
console.log('FINAL STATUS:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha armed! Tools: ${JSON.stringify(lib.tools())}, Cobblestone: ${lib.count('cobblestone')}`);
