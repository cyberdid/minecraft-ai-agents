// programs/212-cook-porkchops-eat-and-bed.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

// 1. Walk 47m West back to base at (293, 72, -54)
bot.pathfinder.stop();
console.log('Returning to Base Camp (293, 72, -54)...');
bot.chat('delta: Returning to Base Camp with 3 porkchops to cook and eat before nightfall...');

try {
  await lib.goTo(293, 72, -54, 2);
} catch (err) {
  console.log('goTo base notice:', err.message);
  await bot.lookAt(new Vec3(293, 72, -54), true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  bot.setControlState('jump', true);
  await sleep(6000);
  bot.setControlState('forward', false);
  bot.setControlState('sprint', false);
  bot.setControlState('jump', false);
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

// 3. Smelt raw porkchops in furnace at (295, 72, -55)
const furnacePos = new Vec3(295, 72, -55);
const furnaceBlock = bot.blockAt(furnacePos);
if (furnaceBlock && lib.count('porkchop') > 0) {
  console.log(`Smelting ${lib.count('porkchop')} porkchops...`);
  try {
    const fuel = lib.count('oak_planks') > 0 ? 'oak_planks' : 'stick';
    await lib.smelt('porkchop', fuel, lib.count('porkchop'));
    console.log('Smelting complete!');
  } catch (e) {
    console.log('Smelt error:', e.message);
  }
}

// 4. Eat cooked porkchop to restore food from 10 to 20!
console.log('Eating food to restore health/food...');
try {
  await lib.eat();
  console.log('Ate food! Current food:', bot.food, 'Health:', bot.health);
} catch (e) {
  console.log('Eat notice:', e.message);
}

// 5. Deposit remaining cooked food in chest for Alpha
const cookedCount = lib.count('cooked_porkchop');
if (cookedCount > 0) {
  try {
    const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
    if (chestBlock) {
      const chest = await bot.openChest(chestBlock);
      const item = lib.bot().inventory.items().find(i => i.name === 'cooked_porkchop');
      if (item) {
        await chest.deposit(item.type, null, item.count);
        console.log(`Deposited ${item.count} cooked_porkchop in chest for Alpha!`);
        bot.chat(`delta: Deposited ${item.count} cooked porkchop in chest for Alpha!`);
      }
      chest.close();
    }
  } catch (e) {}
}

// 6. Lock bed spawn point
try {
  await lib.setSpawn();
  console.log('Bed spawn set!');
} catch (e) {}

// 7. Wait for sleep time (tick >= 12542) and sleep in bed
console.log('Waiting for sleep time...');
for (let i = 0; i < 30; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.canSleep) {
    console.log(`canSleep is true! Time: ${t.timeOfDay}. Sleeping in bed...`);
    try {
      await lib.sleepInBed();
      console.log('Slept in bed!');
      bot.chat('delta: Slept in bed, night skipped to dawn!');
    } catch (e) {
      console.log('Sleep notice:', e.message);
    }
    break;
  }
  await sleep(1000);
}

console.log('Final time info:', JSON.stringify(lib.time()));
console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final status:', JSON.stringify(lib.status()));
