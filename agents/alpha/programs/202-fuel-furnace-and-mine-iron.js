// programs/202-fuel-furnace-and-mine-iron.js
console.log('--- Fuel Furnace, Hunt Sheep for Bed 2 & Mine Iron ---');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Night in:', lib.time().secondsUntilNight);

// 1. Put 1 coal in furnace (295, 72, -55) to finish smelting waiting raw_iron
const furnBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnBlock) {
  try {
    const furn = await bot.openFurnace(furnBlock);
    if (!furn.fuelItem() && lib.count('coal') > 0) {
      console.log('Fueling furnace with 1 coal...');
      await furn.putFuel(mcData.itemsByName.coal.id, null, 1);
    }
    if (furn.outputItem()) {
      await furn.takeOutput();
    }
    furn.close();
  } catch (e) {
    console.log('Furnace note:', e.message);
  }
}

// 2. Chat with Beta
bot.chat('beta: Going to east hill (350, -35) to mine 15+ iron and look for 1 more wool for Bed 2. Back before dusk!');

// 3. Step outside base door
try {
  if (typeof passDoorOut === 'function') await passDoorOut();
  else await lib.goThroughDoor(294, 72, -54);
  console.log('Stepped outside. Current pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door exit error:', e.message);
}

// 4. Check for sheep nearby on the way
const sheepTarget = Object.values(bot.entities).find(e => 
  e && e.name === 'sheep' && e.position && e.position.distanceTo(bot.entity.position) < 45
);
if (sheepTarget) {
  console.log(`Found sheep nearby at ${lib.fmt(sheepTarget.position)}! Hunting for wool...`);
  try {
    const huntRes = await lib.hunt('sheep', 1);
    console.log('Hunt sheep result:', JSON.stringify(huntRes));
  } catch (e) {
    console.log('Hunt sheep note:', e.message);
  }
}

// 5. Travel to East hill (350, 55, -35)
console.log('Traveling to East hill (350, -35)...');
try {
  await lib.goToXZ(350, -35, { timeoutMs: 30000 });
  console.log('Arrived at East hill! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Travel warning:', e.message);
  try { await lib.goTo(350, 65, -35, 5, { timeoutMs: 20000 }); } catch (e2) {}
}

// 6. Mine iron ores
let mined = 0;
while (!isCancelled() && lib.time().secondsUntilNight > 110 && lib.count('raw_iron') < 16) {
  const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 20 });
  console.log(`Found ${ores.length} iron ores in range.`);
  if (ores.length === 0) break;
  
  // Sort by vertical distance first to avoid deep digs
  ores.sort((a, b) => Math.abs(a.position.y - bot.entity.position.y) - Math.abs(b.position.y - bot.entity.position.y));
  const target = ores[0];

  // If ore is more than 8 blocks down, avoid digging blindly
  if (bot.entity.position.y - target.position.y > 8) {
    console.log(`Skipping deep ore at ${lib.fmt(target.position)} (dy=${target.position.y - bot.entity.position.y})`);
    break;
  }

  console.log(`Mining iron ore at ${lib.fmt(target.position)}...`);
  try {
    await lib.goTo(target.position.x, target.position.y, target.position.z, 2, { dig: true, timeoutMs: 15000 });
    await lib.dig(target.position.x, target.position.y, target.position.z);
    await lib.pickup(4);
    mined++;
  } catch (e) {
    console.log(`Dig error at ${lib.fmt(target.position)}:`, e.message);
    break;
  }
}

console.log(`Mined ${mined} iron ores. Total raw_iron in inv: ${lib.count('raw_iron')}`);

// 7. Return to base before dusk
console.log('Returning to base entrance (294, 72, -52)...');
try {
  await lib.goTo(294, 72, -52, 1, { timeoutMs: 30000 });
} catch (e) {
  console.log('Return goTo warning:', e.message);
  try { await lib.goToXZ(294, -52, { timeoutMs: 25000 }); } catch (e2) {}
}

console.log('Entering base...');
try {
  if (typeof passDoorIn === 'function') await passDoorIn();
  else await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door enter error:', e.message);
}

// 8. Distribute raw iron across furnaces to smelt
const rawIron = lib.count('raw_iron');
if (rawIron > 0) {
  console.log(`Splitting ${rawIron} raw_iron into base furnaces...`);
  const furns = [new Vec3(295, 72, -55), new Vec3(295, 72, -54), new Vec3(295, 72, -56)];
  let left = rawIron;
  for (const fpos of furns) {
    if (left <= 0) break;
    const b = bot.blockAt(fpos);
    if (b && b.name === 'furnace') {
      try {
        const furn = await bot.openFurnace(b);
        const putCount = Math.min(left, 4);
        if (!furn.fuelItem() && lib.count('coal') > 0) {
          await furn.putFuel(mcData.itemsByName.coal.id, null, 1);
        }
        if (!furn.inputItem()) {
          await furn.putInput(mcData.itemsByName.raw_iron.id, null, putCount);
          left -= putCount;
          console.log(`Loaded ${putCount} raw_iron into furnace at ${lib.fmt(fpos)}`);
        }
        furn.close();
      } catch (e) {}
    }
  }
}

bot.chat(`beta: Returned to base with ${lib.count('raw_iron')} raw_iron and ${lib.count('iron_ingot')} iron_ingots.`);
console.log('Finished 202. Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight, 's');
