// programs/030-smelt-furnace-and-mine-iron.js
// Fuel furnace, scout/mine 15+ iron on southeast hill with iron_pickaxe, return before night

console.log('alpha at:', lib.fmt(bot.entity.position));

// 1. Add fuel to furnace at (295, 72, -55) to finish smelting input raw_iron
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    if (furnace.inputItem() && !furnace.fuelItem()) {
      // Put 2 oak_planks in fuel slot
      console.log('Adding fuel to furnace...');
      await furnace.putFuel(mcData.itemsByName.oak_planks.id, null, 2);
    }
    furnace.close();
  } catch (e) {
    console.log('Furnace fuel note:', e.message);
  }
}

// 2. Check beta
const beta = bot.players['beta'];
if (beta && beta.entity) {
  console.log('beta pos:', lib.fmt(beta.entity.position));
}

bot.chat('alpha: Heading to east hill (340, -30) with iron pickaxe to mine 15+ iron for both players.');

// 3. Step outside
const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Stepping outside...');
await lib.walkTo(294, -51);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}

// 4. Travel towards (340, 70, -30)
console.log('Travelling towards (340, -30)...');
try {
  await lib.goToXZ(340, -30);
} catch (e) {
  console.log('Travel note:', e.message);
}

// 5. Scan and mine iron ores on the hill
console.log('Scanning for iron ore near (340, -30)...');
const ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 48, count: 25 });
console.log(`Found ${ironOres.length} iron ore blocks on hill`);

for (const ore of ironOres) {
  if (isCancelled()) break;
  if (lib.time().secondsUntilNight < 90) {
    console.log('Night approaching (<90s), returning to base to sleep!');
    break;
  }
  try {
    console.log(`Mining iron at ${lib.fmt(ore.position)}...`);
    await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true });
    await lib.dig(ore.position.x, ore.position.y, ore.position.z);
    await lib.pickup(4);
  } catch (e) {
    console.log(`Dig error at ${lib.fmt(ore.position)}:`, e.message);
  }
  if (lib.count('raw_iron') >= 18) {
    console.log('Reached 18 raw iron!');
    break;
  }
}

console.log('Raw iron in inventory now:', lib.count('raw_iron'));

// 6. Return to base doorstep
console.log('Returning to base at (294, 72, -52)...');
await lib.goTo(294, 72, -52, 1, { dig: true });

// Step inside base
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
await lib.walkTo(294, -56);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's');

return {
  rawIron: lib.count('raw_iron'),
  time: time.secondsUntilNight
};
