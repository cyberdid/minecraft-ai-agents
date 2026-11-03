console.log('=== Program 909: Secure Base, Check Furnaces & Sleep ===');
globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

console.log('Beta pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'HP:', bot.health, 'Food:', bot.food);

// 1. Ensure we are safely inside the house (z <= -55) and door is closed
if (bot.entity.position.z > -54.5) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}
}

// Move to center of base house
try {
  await lib.goTo(293, 72, -56, 0.8, { timeoutMs: 4000 });
} catch (e) {}

// Ensure door at (294, 72, -54) is closed
const door = bot.blockAt(new Vec3(294, 72, -54));
if (door && door.name.includes('door')) {
  // If door is open, toggle it
  if (door._properties && door._properties.open) {
    console.log('Closing base door...');
    await bot.activateBlock(door);
  }
}

// 2. Check all furnaces
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const fp of furnacePositions) {
  const fb = bot.blockAt(fp);
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fp)}:`);
      const input = f.inputItem();
      const fuel = f.fuelItem();
      const output = f.outputItem();
      console.log(`  input: ${input ? `${input.name} x${input.count}` : 'none'}`);
      console.log(`  fuel: ${fuel ? `${fuel.name} x${fuel.count}` : 'none'}`);
      console.log(`  output: ${output ? `${output.name} x${output.count}` : 'none'}`);
      if (output) {
        console.log(`Taking ${output.name} x${output.count} from furnace...`);
        await f.takeOutput();
      }
      f.close();
    } catch (e) {
      console.log(`Error checking furnace at ${lib.fmt(fp)}: ${e.message}`);
    }
  }
}

// If we got food from furnace, eat it!
let foodInInv = bot.inventory.items().find(i =>
  i.name.includes('cooked') ||
  i.name === 'bread' ||
  i.name === 'baked_potato' ||
  i.name === 'apple'
);
if (foodInInv) {
  console.log(`Eating ${foodInInv.name}...`);
  while (bot.food < 20 && !checkCancelled()) {
    const it = bot.inventory.items().find(i => i.name === foodInInv.name);
    if (!it) break;
    await bot.equip(it, 'hand');
    await bot.consume();
    console.log(`Ate 1 ${foodInInv.name}. Food: ${bot.food}/20, HP: ${bot.health}/20`);
    await sleep(200);
  }
}

// 3. Locate bed inside base
const bedBlock = bot.findBlock({
  matching: b => b && b.name.includes('bed'),
  maxDistance: 6
});

if (bedBlock) {
  console.log(`Found bed at ${lib.fmt(bedBlock.position)}`);
}

// 4. Wait for night (timeOfDay >= 12542) and sleep
console.log(`Current time: ${bot.time.timeOfDay}. Waiting for sleep time (12542+)...`);
while (bot.time.timeOfDay < 12542 && bot.time.timeOfDay > 500 && !checkCancelled()) {
  await sleep(1000);
}

if (!checkCancelled() && bedBlock) {
  console.log(`Night has arrived (${bot.time.timeOfDay})! Attempting to sleep in bed...`);
  try {
    await bot.sleep(bedBlock);
    console.log('Sleeping in bed...');
    bot.chat('Beta: Sleeping in Base Bed to skip night!');
    
    // Wait until wake up
    const sleepStart = Date.now();
    while (bot.isSleeping && Date.now() - sleepStart < 15000 && !checkCancelled()) {
      await sleep(500);
    }
    console.log('Woke up! Time:', bot.time.timeOfDay, 'HP:', bot.health, 'Food:', bot.food);
  } catch (err) {
    console.log('Sleep notice:', err.message);
  }
}

return {
  pos: bot.entity.position,
  time: bot.time.timeOfDay,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
