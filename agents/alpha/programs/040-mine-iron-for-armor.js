// programs/040-mine-iron-for-armor.js
// Harvest wood, hunt animals for meat, mine 25+ iron on east hill for armor!

console.log('alpha at:', lib.fmt(bot.entity.position));

// 1. Step outside base
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

bot.chat('alpha: Day 5 dawn! Heading to east hill to mine iron for full armor and buckets.');

// 2. Harvest 6 logs for charcoal fuel
console.log('Collecting 6 logs for charcoal fuel...');
try {
  await lib.collect('*_log', 6);
  console.log('Logs collected:', lib.count('*_log'));
} catch (e) {
  console.log('Log collect note:', e.message);
}

// 3. Hunt animals nearby on the way if present
const animals = bot.nearestEntity(e => ['cow', 'pig', 'sheep'].includes(e.name) && e.position.distanceTo(bot.entity.position) < 25);
if (animals) {
  console.log(`Hunting nearby ${animals.name}...`);
  try {
    await lib.hunt(animals.name, 2);
  } catch (e) {
    console.log('Hunt note:', e.message);
  }
}

// 4. Head to east hill iron vein at (350, 55, -35)
console.log('Going to east hill iron vein at (350, -35)...');
try {
  await lib.goToXZ(350, -35);
} catch (e) {
  console.log('Travel note:', e.message);
}

// 5. Mine iron ores
console.log('Scanning for iron ores...');
const ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 30 });
console.log(`Found ${ironOres.length} iron ore blocks in range`);

for (const ore of ironOres) {
  if (isCancelled() || lib.time().secondsUntilNight < 150) break;
  try {
    console.log(`Mining iron at ${lib.fmt(ore.position)}...`);
    await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true });
    await lib.dig(ore.position.x, ore.position.y, ore.position.z);
    await lib.pickup(4);
  } catch (e) {
    console.log(`Dig error at ${lib.fmt(ore.position)}:`, e.message);
  }
  if (lib.count('raw_iron') >= 25) {
    console.log('Reached 25+ raw iron!');
    break;
  }
}

console.log('Raw iron in inventory:', lib.count('raw_iron'));

// 6. Return to base
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
console.log('Safely inside base at:', lib.fmt(bot.entity.position));

// 7. Smelt charcoal in furnace: 3 logs = 3 charcoal
if (lib.count('*_log') >= 3) {
  console.log('Smelting 3 charcoal...');
  if (lib.count('*_planks') < 4) {
    await lib.craft('oak_planks', 4);
  }
  try {
    await lib.smelt('oak_log', 'oak_planks', 3);
  } catch (e) {
    console.log('Charcoal smelt note:', e.message);
  }
}

// 8. Start smelting raw iron with charcoal
const rawIronCount = lib.count('raw_iron');
console.log(`Smelting ${rawIronCount} raw iron...`);
if (rawIronCount > 0) {
  const fuel = lib.count('charcoal') > 0 ? 'charcoal' : (lib.count('*_planks') > 0 ? 'oak_planks' : 'oak_log');
  try {
    const smeltRes = await lib.smelt('raw_iron', fuel, Math.min(rawIronCount, 16));
    console.log('Smelt result:', JSON.stringify(smeltRes));
  } catch (e) {
    console.log('Raw iron smelt note:', e.message);
  }
}

console.log('Iron ingots available:', lib.count('iron_ingot'));

// 9. Craft iron armor pieces
// Priority for alpha:
// Chestplate (8 ingots)
if (lib.count('iron_chestplate') === 0 && lib.count('iron_ingot') >= 8) {
  await lib.craft('iron_chestplate', 1);
  console.log('Crafted iron_chestplate!');
}
// Leggings (7 ingots)
if (lib.count('iron_leggings') === 0 && lib.count('iron_ingot') >= 7) {
  await lib.craft('iron_leggings', 1);
  console.log('Crafted iron_leggings!');
}
// Helmet (5 ingots)
if (lib.count('iron_helmet') === 0 && lib.count('iron_ingot') >= 5) {
  await lib.craft('iron_helmet', 1);
  console.log('Crafted iron_helmet!');
}
// Boots (4 ingots)
if (lib.count('iron_boots') === 0 && lib.count('iron_ingot') >= 4) {
  await lib.craft('iron_boots', 1);
  console.log('Crafted iron_boots!');
}

await lib.equipArmor();

bot.chat(`alpha: Armor update: ingots=${lib.count('iron_ingot')}, raw_iron=${lib.count('raw_iron')}. Equipped best armor.`);

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's');

return {
  rawIron: lib.count('raw_iron'),
  ingots: lib.count('iron_ingot'),
  time: time.secondsUntilNight
};
