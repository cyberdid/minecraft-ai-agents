// programs/517-harvest-wood-smelt-shield.js
console.log('=== Program 517: Harvest Wood & Smelt Shield ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.pathfinder.stop();
await sleep(100);

// 1. Step outside to get 2 logs
console.log('Stepping outside...');
await passDoorOut();

console.log('Walking to birch tree at (270, 72, -55)...');
try {
  await lib.goToXZ(270, -55);
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalNear(270, 72, -55, 2));
}

const targetLogs = bot.findBlocks({
  matching: b => b && b.name.endsWith('_log'),
  maxDistance: 8,
  count: 3
});
console.log(`Found ${targetLogs.length} logs.`);
for (const lp of targetLogs) {
  if (lib.count('*_log') >= 2) break;
  try {
    console.log(`Mining log at ${lib.fmt(lp)}...`);
    await lib.dig(lp.x, lp.y, lp.z);
    await lib.pickup(4);
  } catch (err) {
    console.log(`Mine log note: ${err.message}`);
  }
}
console.log('Logs collected:', lib.count('*_log'));

// 2. Return into base
console.log('Returning into base...');
try {
  await lib.goTo(294, 72, -52, 1);
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52, 2));
}
await passDoorIn();
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Craft planks (need at least 8)
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (logItem) {
  await lib.craft('birch_planks', logItem.count * 4);
  console.log('Total planks:', lib.count('*_planks'));
}

// 4. Put fuel in furnace at (295, 72, -55)
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  console.log('Opening furnace at (295, 72, -55)...');
  const furnace = await bot.openFurnace(furnaceBlock);
  const plankItem = bot.inventory.items().find(i => i.name.endsWith('_planks'));
  if (plankItem) {
    console.log(`Putting 2 planks as fuel...`);
    await furnace.putFuel(plankItem.type, null, 2);
  }
  
  console.log('Waiting for iron ingot to smelt...');
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    if (furnace.outputItem() && furnace.outputItem().count >= 1) {
      console.log(`Smelted ${furnace.outputItem().name} x${furnace.outputItem().count}!`);
      await furnace.takeOutput();
      break;
    }
  }
  await furnace.close();
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// 5. Craft Shield! (1 iron ingot + 6 planks)
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield...');
  await lib.craft('shield', 1);
  console.log('SUCCESS: Shield crafted!');
  await lib.equipArmor();
  console.log('Shield equipped in offhand!');
} else {
  console.log(`Ingredients missing for shield: ingots=${lib.count('iron_ingot')}, planks=${lib.count('*_planks')}`);
}

console.log('=== Final Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Gear:', JSON.stringify(lib.tools()));
console.log('Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
