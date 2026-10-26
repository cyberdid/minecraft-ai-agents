// programs/134-check-furnaces-and-sleep-till-dawn.js
console.log('--- Checking Furnaces ---');

const furnaceCoords = [
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -56)
];

for (const coord of furnaceCoords) {
  const block = bot.blockAt(coord);
  if (block && (block.name === 'furnace' || block.name === 'lit_furnace')) {
    try {
      console.log(`Checking furnace at ${lib.fmt(coord)}...`);
      await lib.goNearBlock(coord.x, coord.y, coord.z);
      const furnace = await bot.openFurnace(block);
      const input = furnace.inputItem();
      const fuel = furnace.fuelItem();
      const output = furnace.outputItem();
      console.log(`Furnace ${lib.fmt(coord)}: input=${input?.name}x${input?.count}, fuel=${fuel?.name}x${fuel?.count}, output=${output?.name}x${output?.count}`);
      if (output) {
        console.log(`Taking output ${output.name}x${output.count}...`);
        await furnace.takeOutput();
      }
      furnace.close();
    } catch (e) {
      console.log(`Error checking furnace at ${lib.fmt(coord)}:`, e.message);
    }
  } else {
    console.log(`Block at ${lib.fmt(coord)} is ${block?.name}`);
  }
}

// Check inventory
console.log('Inventory now:', JSON.stringify(lib.inv()));

// If we got food, eat it
if (bot.food < 18) {
  try {
    await lib.eat();
    console.log('Ate food! Food now:', bot.food, 'Health:', bot.health);
  } catch (e) {
    console.log('Eat failed:', e.message);
  }
}

// Make sure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// Sleep until morning
console.log('--- Sleeping until dawn ---');
const t = lib.time();
if (t.canSleep) {
  try {
    console.log('Going to bed...');
    await lib.sleepInBed();
    console.log('In bed. Waiting for dawn...');
    while (!isCancelled() && lib.time().night) {
      await sleep(1000);
      const cur = lib.time();
      if (!cur.night || cur.timeOfDay < 1000 || cur.timeOfDay >= 23460) {
        console.log('Morning arrived! Time:', cur.timeOfDay);
        break;
      }
    }
  } catch (e) {
    console.log('Sleep loop error:', e.message);
  }
}

try {
  await bot.wake();
} catch (e) {}

console.log('Status at end: Health:', bot.health, 'Food:', bot.food, 'Time:', lib.time().timeOfDay, 'Phase:', lib.time().phase);
