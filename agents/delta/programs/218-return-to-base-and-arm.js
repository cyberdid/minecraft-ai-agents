// programs/218-return-to-base-and-arm.js
console.log('Delta pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(300);

// 1. Run East to Base Camp (293, 72, -54)
bot.chat('delta: Running East to Base Camp (293, 72, -54) to re-arm with tools & cobble...');
const waypoints = [
  new Vec3(180, 65, -100),
  new Vec3(240, 68, -75),
  new Vec3(290, 72, -54)
];

for (const wp of waypoints) {
  if (isCancelled()) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
  } catch (e) {
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

// 3. Lock bed spawn point
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
  bot.chat('delta: Inside Base Camp! Bed spawn point locked.');
} catch (err) {
  console.log('setSpawn notice:', err.message);
}

// 4. Check chest for food or tools
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    console.log('Chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
    for (const item of items) {
      if (['cooked_porkchop', 'cooked_beef', 'cooked_cod', 'bread', 'apple'].includes(item.name)) {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew food: ${item.name} x${item.count}`);
      }
    }
    chest.close();
  } catch (e) {}
}

// Eat food if available and food < 20
if (bot.food < 20) {
  try {
    await lib.eat();
  } catch (e) {}
}

// 5. Obtain stone_pickaxe, stone_sword, and 25 cobblestone
console.log('Obtaining stone tools & cobblestone...');
try {
  await lib.obtain('stone_pickaxe', 1);
  console.log('Obtained stone_pickaxe!');
} catch (e) {
  console.log('Pickaxe error:', e.message);
}

try {
  await lib.obtain('stone_sword', 1);
  console.log('Obtained stone_sword!');
} catch (e) {
  console.log('Sword error:', e.message);
}

try {
  await lib.obtain('cobblestone', 25);
  console.log('Obtained 25 cobblestone!');
} catch (e) {
  console.log('Cobblestone error:', e.message);
}

// 6. Return to base shelter
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
} catch (e) {
  await lib.goTo(293, 72, -55, 1);
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final tools:', JSON.stringify(lib.tools()));
bot.chat(`delta: Re-armed and ready! Pickaxe=${lib.count('stone_pickaxe')}, Sword=${lib.count('stone_sword')}, Cobble=${lib.count('cobblestone')}. Ready for high ceiling tunnel!`);
