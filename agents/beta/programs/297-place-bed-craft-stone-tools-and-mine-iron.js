// programs/297-place-bed-craft-stone-tools-and-mine-iron.js
console.log('=== Step 53: Place bed, craft stone tools, mine 8 iron ore ===');

// 1. Walk into base
console.log('Entering base...');
await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -55, 1);
}

// 2. Place bed at (294, 72, -56) if holding bed
if (lib.count('white_bed') > 0) {
  console.log('Placing white_bed at (294, 72, -56)...');
  try {
    await lib.place('white_bed', 294, 72, -56);
    console.log('Bed placed successfully!');
    await lib.setSpawn();
    console.log('Spawn set at bed!');
  } catch (e) {
    console.log('Bed placement note:', e.message);
  }
}

// 3. Craft planks, sticks, stone tools
if (lib.count('*_log') > 0) {
  const logType = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
  await lib.craft(logType.replace('_log', '_planks'), 16);
  await lib.craft('stick', 8);
  await lib.craft('stone_pickaxe', 2);
  await lib.craft('stone_sword', 1);
  await lib.craft('stone_axe', 1);
}

console.log('Beta gear prepped:', {
  inv: lib.inv(),
  tools: lib.tools()
});

// 4. Exit base to mine iron
console.log('Exiting base to mine iron vein at (304, 52, -34)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

await lib.goTo(302, 71, -44, 1, { timeoutMs: 15000 });

// 5. Descend down shaft to y=54
console.log('Descending to y=54 iron vein...');
try {
  await lib.goTo(304, 54, -34, 3, { timeoutMs: 25000, dig: true });
} catch (e) {
  console.log('Descent note:', e.message);
}

// Collect iron ore
try {
  await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
  const got = await lib.collect(['iron_ore', 'deepslate_iron_ore'], 8);
  console.log('Mined iron:', JSON.stringify(got));
} catch (e) {
  console.log('Collect iron note:', e.message);
}

// 6. Return to surface base
console.log('Ascending back to base...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 30000, dig: true });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base safely!');
} catch (e) {
  console.log('Ascent note:', e.message);
}

// 7. Load raw_iron into F1 to smelt
const f1Block = bot.blockAt(new Vec3(295, 72, -55));
if (f1Block && lib.count('raw_iron') > 0) {
  const f1 = await bot.openFurnace(f1Block);
  if (lib.count('*_planks') > 0 && !f1.fuelItem()) {
    const pType = Object.keys(lib.inv()).find(k => k.endsWith('_planks'));
    await f1.putFuel(mcData.itemsByName[pType].id, null, Math.min(6, lib.count(pType)));
  }
  if (!f1.inputItem()) {
    await f1.putInput(mcData.itemsByName.raw_iron.id, null, lib.count('raw_iron'));
    console.log(`Loaded ${lib.count('raw_iron')} raw_iron into F1.`);
  }
  f1.close();
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Mined raw_iron: ${lib.count('raw_iron')}, smelt loaded in F1. Tools: stone_pickaxe: ${lib.count('stone_pickaxe')}.`);
