// programs/203-mine-iron-vein-at-358.js
console.log('--- Mine Iron Vein at (358, 52, -40) ---');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Night in:', lib.time().secondsUntilNight);

bot.chat('beta: Mining iron vein at (358, 52, -40). Back in 2 minutes.');

// 1. Navigate to (358, 52, -40)
console.log('Traveling to (358, 52, -40)...');
try {
  await lib.goTo(358, 52, -40, 3, { dig: true, timeoutMs: 35000 });
  console.log('Arrived near iron vein! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Travel note:', e.message);
  try { await lib.goToXZ(358, -40, { timeoutMs: 25000 }); } catch (e2) {}
}

// 2. Scan and mine iron ores
console.log('Scanning for iron ores at current pos:', lib.fmt(bot.entity.position));
const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 24, count: 20 });
console.log(`Found ${ores.length} iron ores in range.`);

let minedCount = 0;
for (const ore of ores) {
  if (isCancelled() || lib.time().secondsUntilNight < 110) break;
  if (lib.count('raw_iron') >= 16) break;
  console.log(`Mining iron ore at ${lib.fmt(ore.position)}...`);
  try {
    await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true, timeoutMs: 15000 });
    await lib.dig(ore.position.x, ore.position.y, ore.position.z);
    await lib.pickup(4);
    minedCount++;
  } catch (e) {
    console.log(`Dig error at ${lib.fmt(ore.position)}:`, e.message);
  }
}

console.log(`Mined ${minedCount} iron ores. Total raw_iron in inventory: ${lib.count('raw_iron')}`);

// 3. Return to base before dusk
console.log('Returning to base entrance (294, 72, -52)...');
try {
  await lib.goTo(294, 72, -52, 1, { timeoutMs: 30000 });
} catch (e) {
  console.log('Return note:', e.message);
  try { await lib.goToXZ(294, -52, { timeoutMs: 25000 }); } catch (e2) {}
}

// 4. Enter base
console.log('Entering base...');
try {
  if (typeof passDoorIn === 'function') await passDoorIn();
  else await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door enter error:', e.message);
}

// 5. Load raw iron into furnaces to smelt
const rawCount = lib.count('raw_iron');
if (rawCount > 0) {
  console.log(`Loading ${rawCount} raw iron into base furnaces...`);
  const furnPositions = [new Vec3(295, 72, -55), new Vec3(295, 72, -54), new Vec3(295, 72, -56)];
  let remaining = rawCount;
  for (const pos of furnPositions) {
    if (remaining <= 0) break;
    const block = bot.blockAt(pos);
    if (block && block.name === 'furnace') {
      try {
        const furn = await bot.openFurnace(block);
        if (furn.outputItem()) await furn.takeOutput();
        if (!furn.fuelItem() && lib.count('coal') > 0) {
          await furn.putFuel(mcData.itemsByName.coal.id, null, 1);
        }
        if (!furn.inputItem()) {
          const toPut = Math.min(remaining, 4);
          await furn.putInput(mcData.itemsByName.raw_iron.id, null, toPut);
          remaining -= toPut;
          console.log(`Loaded ${toPut} raw iron into furnace at ${lib.fmt(pos)}`);
        }
        furn.close();
      } catch (e) {}
    }
  }
}

bot.chat(`beta: Returned with ${lib.count('raw_iron')} raw_iron. Total iron ingots in inventory: ${lib.count('iron_ingot')}`);
console.log('Finished 203. Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Night in:', lib.time().secondsUntilNight, 's');
