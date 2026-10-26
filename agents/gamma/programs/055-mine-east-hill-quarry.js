// programs/055-mine-east-hill-quarry.js
bot.chat('gamma heading to East Hill quarry (405, 57, 50) with iron pickaxe to mine iron for leggings & bucket!');

console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Exit base
try {
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d) await bot.activateBlock(d);
  await lib.walkTo(294.5, -52.5);
}

// 2. Travel to East Hill quarry (405, 57, 50)
console.log('Moving Stage 1: towards (350, 65, 10)...');
try {
  await lib.goTo(350, 65, 10, 3, { dig: true });
} catch (e) {
  console.log('Stage 1 error:', e.message);
}

console.log('Moving Stage 2: towards (405, 57, 50)...');
try {
  await lib.goTo(405, 57, 50, 3, { dig: true });
} catch (e) {
  console.log('Stage 2 error:', e.message);
}

console.log('Arrived at quarry:', lib.fmt(bot.entity.position));

// 3. Mine iron ores
const ironOres = bot.findBlocks({ matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore', maxDistance: 24, count: 16 });
console.log(`Found ${ironOres.length} iron ores in quarry`);

let mined = 0;
for (const p of ironOres) {
  if (lib.count('raw_iron') >= 10 || isCancelled() || lib.time().secondsUntilNight < 200) break;
  try {
    await lib.goTo(p.x, p.y, p.z, 2, { dig: true });
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
    mined++;
  } catch (e) {}
}

console.log(`Mined ${mined} iron ores. Total raw_iron in inv: ${lib.count('raw_iron')}`);

// 4. Smelt 10 raw_iron
if (lib.count('raw_iron') >= 7 && lib.count('coal') > 0) {
  const toSmelt = Math.min(lib.count('raw_iron'), 10);
  console.log(`Smelting ${toSmelt} raw_iron...`);
  const spot = await lib.freeSpot();
  await lib.place('furnace', spot.x, spot.y, spot.z);
  const fBl = bot.blockAt(spot);
  const f = await bot.openFurnace(fBl);
  const raw = bot.inventory.items().find(i => i.name === 'raw_iron');
  const coal = bot.inventory.items().find(i => i.name === 'coal');
  await f.putInput(raw.type, null, toSmelt);
  await f.putFuel(coal.type, null, Math.ceil(toSmelt / 8));

  const deadline = Date.now() + (toSmelt * 11000 + 4000);
  while (!isCancelled() && Date.now() < deadline && lib.time().secondsUntilNight > 140) {
    await sleep(2000);
    if (f.outputItem() && f.outputItem().count >= toSmelt) break;
  }
  if (f.outputItem()) {
    console.log(`Took ${f.outputItem().count} iron ingots!`);
    await f.takeOutput();
  }
  if (f.inputItem()) await f.takeInput();
  if (f.fuelItem()) await f.takeFuel();
  f.close();
  await lib.dig(spot.x, spot.y, spot.z);
  await lib.pickup(4);
}

// 5. Craft iron_leggings and bucket
console.log('Iron ingots available:', lib.count('iron_ingot'));
await lib.ensureTable();
if (lib.count('iron_ingot') >= 7 && !lib.count('iron_leggings')) {
  console.log('Crafting iron_leggings...');
  await lib.craft('iron_leggings', 1);
}
if (lib.count('iron_ingot') >= 3 && !lib.count('bucket') && !lib.count('water_bucket')) {
  console.log('Crafting bucket...');
  await lib.craft('bucket', 1);
}

// Equip armor
await lib.equipArmor();

// 6. Return to base and fill water bucket
console.log('Returning to base...');
try {
  await lib.goTo(350, 65, 10, 3, { dig: true });
  await lib.goTo(294, 72, -53, 1, { dig: true });
} catch (e) {
  console.log('Return error:', e.message);
}

if (lib.count('bucket') > 0 && !lib.count('water_bucket')) {
  console.log('Filling water bucket...');
  try {
    const res = await lib.fillBucket('water');
    console.log('Bucket result:', res);
  } catch (e) {
    console.log('Fill bucket error:', e.message);
  }
}

// Enter base
try {
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {}

console.log('Inside base at', lib.fmt(bot.entity.position));
console.log('Gamma gear now:', JSON.stringify(lib.tools()));
console.log('Final inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma report: FULL IRON ARMOR COMPLETE! Gear: ${JSON.stringify(lib.tools())}, water_bucket=${lib.count('water_bucket')}`);
