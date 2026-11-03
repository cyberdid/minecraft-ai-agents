// programs/359-gearup-quarry-and-shield.js
console.log('=== GEAR UP: COBBLESTONE, IRON & SHIELD ===');
console.log('Current pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Enter base
try {
  await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 10000 });
} catch (e) {}

try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// Check chest
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(contents));
  // If iron, raw_iron, or planks in chest, withdraw
  for (const item of ['iron_ingot', 'raw_iron', 'shield', 'oak_planks', 'birch_planks']) {
    if (contents && contents[item] > 0) {
      console.log(`Withdrawing ${item} from chest...`);
      await lib.withdraw({ [item]: 'all' }, 293, 72, -57);
    }
  }
} catch (e) {
  console.log('Chest check error:', e.message);
}

// Check base furnaces
for (const fz of [-54, -55, -56]) {
  const fPos = new Vec3(295, 72, fz);
  const fb = bot.blockAt(fPos);
  if (fb && fb.name.includes('furnace')) {
    try {
      const furnace = await bot.openFurnace(fb);
      const out = furnace.outputItem();
      if (out) {
        console.log(`Furnace at ${lib.fmt(fPos)} output: ${out.name} x${out.count}`);
        await furnace.takeOutput();
      }
      furnace.close();
    } catch (e) {}
  }
}

console.log('Inv after base check:', JSON.stringify(lib.inv()));

// 2. Step outside to quarry cobblestone and wood
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -52.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// If we need wood for planks/shield
if (lib.count('*_planks') < 6) {
  console.log('Collecting 2 logs for planks...');
  try {
    await lib.collect('*_log', 2);
    await lib.craft('oak_planks', 8);
  } catch (e) {
    try { await lib.craft('birch_planks', 8); } catch (e2) {}
  }
}

// Quarry cobblestone up to 40+
console.log('Quarrying cobblestone on east hill...');
try {
  await lib.goTo(304, 71, -50, 2, { dig: true, timeoutMs: 10000 });
  const cobbleNeeded = Math.max(0, 40 - lib.count('cobblestone'));
  if (cobbleNeeded > 0) {
    await lib.collect('stone', cobbleNeeded);
    console.log(`Mined cobblestone! Total cobble: ${lib.count('cobblestone')}`);
  }
} catch (e) {
  console.log('Quarry error:', e.message);
}

// Check if we have raw iron to smelt
if (lib.count('raw_iron') > 0 && lib.count('iron_ingot') === 0) {
  console.log('Smelting raw iron...');
  try {
    await lib.smelt('raw_iron', 'coal', 1);
  } catch (e) {
    try { await lib.smelt('raw_iron', 'birch_planks', 1); } catch (e2) {}
  }
}

// Craft shield if we have iron ingot and planks
if (lib.count('iron_ingot') >= 1 && lib.count('shield') === 0) {
  console.log('Crafting SHIELD...');
  try {
    await lib.craft('shield', 1);
    console.log('SHIELD CRAFTED!');
  } catch (e) {
    console.log('Shield craft error:', e.message);
  }
}

// Equip armor & shield!
try {
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Equipped gear! Tools/Gear:', JSON.stringify(lib.tools()));
} catch (e) {}

console.log('Final inventory:', JSON.stringify(lib.inv()));
