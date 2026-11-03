// programs/638-sleep-night-and-furnace-check.js
console.log('=== Program 638: Sleep Through Night & Check Furnaces/Gear ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

// Step 1: Wait for sleep time (12542) and sleep in bed
const t = bot.time.timeOfDay;
if (t < 23460 && t > 12500) {
  console.log('Sleep time active! Finding bed...');
  const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
  if (bed) {
    console.log('Found bed at', lib.fmt(bed.position));
    try {
      await lib.setSpawn();
      console.log('Spawn set!');
    } catch (e) {}
    try {
      console.log('Sleeping in bed...');
      await bot.sleep(bed);
      console.log('Sleeping...');
      await sleep(5000);
      try { await bot.wake(); } catch (e) {}
      console.log('Woke up! Time:', bot.time.timeOfDay);
    } catch (err) {
      console.log('Sleep error:', err.message);
    }
  }
}

// Step 2: Check all furnaces at base
const furnacePositions = [
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -56)
];

for (const fp of furnacePositions) {
  const fb = bot.blockAt(fp);
  if (fb && (fb.name === 'furnace' || fb.name === 'blast_furnace' || fb.name === 'smoker')) {
    console.log(`Inspecting furnace at ${lib.fmt(fp)} (${fb.name})...`);
    try {
      const f = await bot.openFurnace(fb);
      const input = f.inputItem();
      const fuel = f.fuelItem();
      const output = f.outputItem();
      console.log(`Furnace at ${lib.fmt(fp)}: input=${input?.name}x${input?.count}, fuel=${fuel?.name}x${fuel?.count}, output=${output?.name}x${output?.count}`);
      if (output) {
        await f.takeOutput();
        console.log(`Took output: ${output.name}x${output.count}`);
      }
      f.close();
    } catch (err) {
      console.log(`Furnace at ${lib.fmt(fp)} error:`, err.message);
    }
  }
}

// Step 3: Check nearby chests
const chests = bot.findBlocks({ matching: b => b && b.name.includes('chest'), maxDistance: 10 });
console.log(`Found ${chests.length} chests nearby.`);
for (const cp of chests) {
  const cb = bot.blockAt(cp);
  try {
    const c = await bot.openChest(cb);
    const items = c.containerItems().map(i => `${i.name}x${i.count}`);
    console.log(`Chest at ${lib.fmt(cp)} items:`, items.join(', ') || 'empty');
    for (const item of c.containerItems()) {
      if (item.name.includes('iron') || item.name.includes('gold') || item.name.includes('shield') ||
          item.name.includes('sword') || item.name.includes('cooked') || item.name.includes('bread') ||
          item.name.includes('coal') || item.name.includes('charcoal')) {
        try {
          await c.withdraw(item.type, null, item.count);
          console.log(`Withdrew ${item.name}x${item.count}`);
        } catch (e) {}
      }
    }
    c.close();
  } catch (err) {
    console.log(`Chest at ${lib.fmt(cp)} error:`, err.message);
  }
}

// Step 4: Equip any gear found
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('=== Program 638 Complete ===');
console.log('Final inv:', lib.inv(), 'HP:', bot.health, 'Time:', bot.time.timeOfDay);
