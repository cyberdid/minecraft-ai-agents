// programs/041-iron-expedition.js
bot.chat('gamma launching East Hill Iron Expedition for Milestone 3 armor & tools!');

console.log('gamma starting at:', lib.fmt(bot.entity.position));

// 1. Exit base
try {
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d) await bot.activateBlock(d);
  await lib.walkTo(294.5, -52.5);
}

// 2. Travel to East Hill in 2 stages
console.log('Stage 1: walking towards (340, 65, 10)...');
try {
  await lib.goTo(340, 65, 10, 3, { dig: true });
} catch (e) {
  console.log('Stage 1 goTo error:', e.message);
}

console.log('Stage 2: walking towards (405, 65, 55)...');
try {
  await lib.goTo(405, 65, 55, 3, { dig: true });
} catch (e) {
  console.log('Stage 2 goTo error:', e.message);
}

console.log('Arrived at East Hill:', lib.fmt(bot.entity.position));

// 3. Mine coal ores
const coalTargets = bot.findBlocks({ matching: b => b.name === 'coal_ore' || b.name === 'deepslate_coal_ore', maxDistance: 24, count: 12 });
console.log(`Found ${coalTargets.length} coal ores nearby`);
for (const p of coalTargets) {
  if (lib.count('coal') >= 12 || isCancelled()) break;
  try {
    await lib.goTo(p.x, p.y, p.z, 2, { dig: true });
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
  } catch (e) {}
}

console.log('Coal gathered:', lib.count('coal'));

// 4. Mine iron ores
const ironTargets = bot.findBlocks({ matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore', maxDistance: 32, count: 20 });
console.log(`Found ${ironTargets.length} iron ores nearby`);
for (const p of ironTargets) {
  if (isCancelled() || lib.time().secondsUntilNight < 180) break;
  try {
    await lib.goTo(p.x, p.y, p.z, 2, { dig: true });
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
  } catch (e) {}
}

console.log('Raw iron gathered:', lib.count('raw_iron'));

// 5. Smelt raw iron into ingots
if (lib.count('raw_iron') > 0 && lib.count('coal') > 0) {
  console.log(`Smelting ${lib.count('raw_iron')} raw_iron...`);
  const spot = await lib.freeSpot();
  await lib.place('furnace', spot.x, spot.y, spot.z);
  const fBl = bot.blockAt(spot);
  const f = await bot.openFurnace(fBl);
  const raw = bot.inventory.items().find(i => i.name === 'raw_iron');
  const coal = bot.inventory.items().find(i => i.name === 'coal');
  await f.putInput(raw.type, null, raw.count);
  await f.putFuel(coal.type, null, Math.ceil(raw.count / 8));

  const countToSmelt = raw.count;
  const deadline = Date.now() + (countToSmelt * 11000 + 5000);
  while (!isCancelled() && Date.now() < deadline && lib.time().secondsUntilNight > 140) {
    await sleep(1000);
    if (f.outputItem() && f.outputItem().count >= countToSmelt) break;
  }
  if (f.outputItem()) {
    console.log('Took smelted ingots:', f.outputItem().count);
    await f.takeOutput();
  }
  if (f.inputItem()) await f.takeInput();
  if (f.fuelItem()) await f.takeFuel();
  f.close();
  await lib.dig(spot.x, spot.y, spot.z);
  await lib.pickup(4);
}

// 6. Craft armor / tools if ingots available
console.log('Iron ingots available:', lib.count('iron_ingot'));
await lib.ensureTable();
if (lib.count('iron_ingot') >= 8 && !lib.count('iron_chestplate')) {
  try { await lib.craft('iron_chestplate', 1); } catch (e) {}
}
if (lib.count('iron_ingot') >= 7 && !lib.count('iron_leggings')) {
  try { await lib.craft('iron_leggings', 1); } catch (e) {}
}
if (lib.count('iron_ingot') >= 5 && !lib.count('iron_helmet')) {
  try { await lib.craft('iron_helmet', 1); } catch (e) {}
}
if (lib.count('iron_ingot') >= 4 && !lib.count('iron_boots')) {
  try { await lib.craft('iron_boots', 1); } catch (e) {}
}
if (lib.count('iron_ingot') >= 3 && !lib.count('iron_pickaxe')) {
  try { await lib.craft('iron_pickaxe', 1); } catch (e) {}
}
if (lib.count('iron_ingot') >= 3 && !lib.count('bucket')) {
  try { await lib.craft('bucket', 1); } catch (e) {}
}

// Equip best armor
await lib.equipArmor();

// 7. Return to base before night
console.log('Time until night:', lib.time().secondsUntilNight);
console.log('Returning to base...');
try {
  await lib.goTo(340, 65, 10, 3, { dig: true });
  await lib.goTo(294, 72, -53, 1, { dig: true });
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  console.log('Return error:', e.message);
}

console.log('Inside base. Final inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma back at base! Gear: ${JSON.stringify(lib.tools())}. Armor equipped!`);
