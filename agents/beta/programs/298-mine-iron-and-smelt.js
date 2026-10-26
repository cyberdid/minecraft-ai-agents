// programs/298-mine-iron-and-smelt.js
console.log('=== Step 54: Mine 8 iron ore and start smelting ===');

// 1. Exit base
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

// 2. Walk to shaft entrance
console.log('Walking to shaft entrance (302, 71, -44)...');
await lib.goTo(302, 71, -44, 1, { timeoutMs: 15000 });

// 3. Descend to y=54
console.log('Descending to y=54 iron vein...');
try {
  await lib.goTo(304, 54, -34, 3, { timeoutMs: 25000, dig: true });
  console.log('At iron vein level! Beta at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Descent note:', e.message);
}

// 4. Mine iron ore
console.log('Mining iron ore blocks...');
try {
  await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
  const got = await lib.collect(['iron_ore', 'deepslate_iron_ore'], 8);
  console.log('Mined iron:', JSON.stringify(got));
} catch (e) {
  console.log('Collect note:', e.message);
}

// 5. Ascend back to base
console.log('Ascending back to base...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 30000, dig: true });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base safely!');
} catch (e) {
  console.log('Ascent note:', e.message);
}

// 6. Load F1 with fuel and raw_iron
const f1Block = bot.blockAt(new Vec3(295, 72, -55));
if (f1Block && lib.count('raw_iron') > 0) {
  const f1 = await bot.openFurnace(f1Block);
  if (!f1.fuelItem() && lib.count('birch_planks') >= 6) {
    await f1.putFuel(mcData.itemsByName.birch_planks.id, null, 6);
  }
  if (!f1.inputItem()) {
    await f1.putInput(mcData.itemsByName.raw_iron.id, null, lib.count('raw_iron'));
    console.log(`Loaded ${lib.count('raw_iron')} raw_iron into F1.`);
  }
  f1.close();
}

// 7. Extract flint from gravel if we need flint
const placeSpot = new Vec3(293, 72, -55);
let flintTries = 0;
while (lib.count('flint') === 0 && lib.count('gravel') > 0 && flintTries < 25 && !isCancelled()) {
  flintTries++;
  if (!bot.blockAt(placeSpot) || bot.blockAt(placeSpot).name === 'air') {
    await lib.place('gravel', placeSpot.x, placeSpot.y, placeSpot.z);
  }
  if (bot.blockAt(placeSpot)?.name === 'gravel') {
    await lib.dig(placeSpot.x, placeSpot.y, placeSpot.z);
    await lib.pickup(4);
  }
  await sleep(150);
}
console.log(`Flint extraction result: ${lib.count('flint')} flint.`);

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Mined raw_iron: ${lib.count('raw_iron')}, flint: ${lib.count('flint')}, F1 smelting. Ready to craft iron gear!`);
