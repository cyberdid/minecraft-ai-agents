// programs/034-mine-hill-iron-for-milestone2.js
// Harvest wood, mine 15-20 iron ore on east hill, smelt, craft beta's iron tools into chest!

console.log('alpha at:', lib.fmt(bot.entity.position));

// 1. Check beta presence
const beta = bot.players['beta'];
if (beta && beta.entity) {
  console.log('beta pos:', lib.fmt(beta.entity.position));
}

bot.chat('alpha: Heading to east hill to mine 20 iron for beta tools and armor.');

// 2. Step outside base
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

// 3. Harvest 4 oak logs for fuel and sticks on the way
console.log('Collecting 4 logs for fuel and sticks...');
try {
  await lib.collect('*_log', 4);
  console.log('Logs collected:', lib.count('*_log'));
} catch (e) {
  console.log('Log collect note:', e.message);
}

// 4. Head to east hill (345, 55, -35)
console.log('Going to east hill iron vein at (345, 55, -35)...');
try {
  await lib.goToXZ(345, -35);
} catch (e) {
  console.log('Travel note:', e.message);
}

// 5. Find and mine all iron ore in range
const ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 20 });
console.log(`Found ${ironOres.length} iron ores on hill`);

for (const ore of ironOres) {
  if (isCancelled() || lib.time().secondsUntilNight < 120) break;
  try {
    console.log(`Mining iron at ${lib.fmt(ore.position)}...`);
    await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true });
    await lib.dig(ore.position.x, ore.position.y, ore.position.z);
    await lib.pickup(4);
  } catch (e) {
    console.log(`Dig error at ${lib.fmt(ore.position)}:`, e.message);
  }
  if (lib.count('raw_iron') >= 16) {
    console.log('Reached 16+ raw iron!');
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

// 7. Craft planks for fuel and sticks
if (lib.count('*_log') > 0) {
  await lib.craft('oak_planks', 12);
}
if (lib.count('stick') < 6 && lib.count('*_planks') > 0) {
  await lib.craft('stick', 8);
}

// 8. Smelt raw iron in furnace
const rawIronCount = lib.count('raw_iron');
console.log(`Smelting ${rawIronCount} raw iron...`);
if (rawIronCount > 0) {
  try {
    const smeltRes = await lib.smelt('raw_iron', 'oak_planks', Math.min(rawIronCount, 12));
    console.log('Smelt result:', JSON.stringify(smeltRes));
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

console.log('Iron ingots available:', lib.count('iron_ingot'));

// 9. Craft beta's tools and put into chest at (293, 72, -57)
const chestPos = { x: 293, y: 72, z: -57 };

// beta pickaxe (3 ingots)
if (lib.count('iron_ingot') >= 3) {
  try {
    await lib.craft('iron_pickaxe', 1);
    console.log('Crafted beta iron_pickaxe');
    await lib.deposit({ iron_pickaxe: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Deposited beta iron_pickaxe in chest');
  } catch (e) {
    console.log('Beta pick craft note:', e.message);
  }
}

// beta sword (2 ingots)
if (lib.count('iron_ingot') >= 2) {
  try {
    await lib.craft('iron_sword', 1);
    console.log('Crafted beta iron_sword');
    await lib.deposit({ iron_sword: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Deposited beta iron_sword in chest');
  } catch (e) {
    console.log('Beta sword craft note:', e.message);
  }
}

// beta axe (3 ingots)
if (lib.count('iron_ingot') >= 3) {
  try {
    await lib.craft('iron_axe', 1);
    console.log('Crafted beta iron_axe');
    await lib.deposit({ iron_axe: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Deposited beta iron_axe in chest');
  } catch (e) {
    console.log('Beta axe craft note:', e.message);
  }
}

bot.chat('alpha: Beta tools crafted and placed in base chest! Milestone 2 progress.');

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's');

return {
  rawIronLeft: lib.count('raw_iron'),
  ingotsLeft: lib.count('iron_ingot'),
  time: time.secondsUntilNight
};
