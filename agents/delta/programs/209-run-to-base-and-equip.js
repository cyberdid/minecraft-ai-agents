// programs/209-run-to-base-and-equip.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Run 150m East to Base Camp (293, 72, -54)
bot.pathfinder.stop();
console.log('Running 150m East to Base Camp...');
bot.chat('delta: Running 150m from (138, 62, -50) to Base Camp (293, 72, -54)...');

const waypoints = [
  new Vec3(190, 65, -52),
  new Vec3(240, 68, -52),
  new Vec3(290, 72, -54)
];

for (const wp of waypoints) {
  if (isCancelled()) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
  } catch (e) {
    // Direct sprint fallback
    await bot.lookAt(new Vec3(wp.x, bot.entity.position.y, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(5000);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
    bot.setControlState('jump', false);
  }
}

console.log('Near base pos:', lib.fmt(bot.entity.position));

// 2. Enter base shelter through door
const doorPos = new Vec3(294, 73, -54);
const door = bot.blockAt(doorPos) || bot.blockAt(new Vec3(294, 72, -54));
if (door && door.name.includes('door')) {
  try {
    await lib.goThroughDoor(door.position.x, door.position.y, door.position.z);
    console.log('Entered base through door!');
  } catch (err) {
    await lib.goTo(293, 72, -55, 1);
  }
} else {
  await lib.goTo(293, 72, -55, 1);
}

console.log('Inside base pos:', lib.fmt(bot.entity.position));

// 3. Lock bed spawn
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
  bot.chat('delta: Inside Base Camp! Bed spawn point locked.');
} catch (err) {
  console.log('setSpawn notice:', err.message);
}

// 4. Check chest contents
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name === 'chest') {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    console.log('Chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
    
    // Withdraw any cobblestone, iron, weapons, or food
    for (const item of items) {
      if (['cobblestone', 'iron_ingot', 'stone_sword', 'stone_pickaxe', 'shield', 'cooked_beef', 'cooked_porkchop', 'bread'].includes(item.name)) {
        console.log(`Withdrawing ${item.name} x${item.count}...`);
        await chest.withdraw(item.type, null, item.count);
      }
    }
    chest.close();
  } catch (err) {
    console.log('Chest error:', err.message);
  }
}

// 5. Check furnaces for output
const furnaces = bot.findBlocks({
  matching: b => b.name.includes('furnace'),
  maxDistance: 8,
  count: 3
});
for (const f of furnaces) {
  try {
    const block = bot.blockAt(f);
    const furnace = await bot.openFurnace(block);
    if (furnace.outputItem()) {
      console.log(`Furnace at ${lib.fmt(f)} output: ${furnace.outputItem().name} x${furnace.outputItem().count}`);
      await furnace.takeOutput();
    }
    furnace.close();
  } catch (e) {}
}

// 6. Equip armor / weapon
try {
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Status final:', JSON.stringify(lib.status()));
