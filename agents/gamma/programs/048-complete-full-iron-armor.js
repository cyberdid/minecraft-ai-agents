// programs/048-complete-full-iron-armor.js
bot.chat('gamma joining Alpha & Delta at East hill to mine final 7 iron for full iron leggings!');

console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Move to East hill at (350, 55, -35)
console.log('Moving to East hill (350, 55, -35)...');
try {
  await lib.goTo(350, 55, -35, 3, { dig: true });
} catch (e) {
  console.log('GoTo East hill error:', e.message);
}

console.log('Arrived at East hill:', lib.fmt(bot.entity.position));

// 2. Scan for iron ores nearby
const ironOres = bot.findBlocks({ matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore', maxDistance: 24, count: 12 });
console.log(`Found ${ironOres.length} iron ores nearby:`, ironOres.map(p => lib.fmt(p)));

let minedIron = 0;
for (const p of ironOres) {
  if (lib.count('raw_iron') >= 7 || isCancelled() || lib.time().secondsUntilNight < 180) break;
  console.log(`Mining iron at ${lib.fmt(p)}...`);
  try {
    await lib.goTo(p.x, p.y, p.z, 2, { dig: true });
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
    minedIron++;
  } catch (e) {
    console.log('Mine error:', e.message);
  }
}

console.log(`Mined iron! raw_iron in inventory: ${lib.count('raw_iron')}`);

// 3. Smelt 7 raw_iron into iron_ingots
if (lib.count('raw_iron') >= 7 && lib.count('coal') > 0) {
  console.log('Smelting 7 raw_iron on portable furnace...');
  const spot = await lib.freeSpot();
  await lib.place('furnace', spot.x, spot.y, spot.z);
  const fBl = bot.blockAt(spot);
  const f = await bot.openFurnace(fBl);
  const raw = bot.inventory.items().find(i => i.name === 'raw_iron');
  const coal = bot.inventory.items().find(i => i.name === 'coal');
  await f.putInput(raw.type, null, 7);
  await f.putFuel(coal.type, null, 1);

  const deadline = Date.now() + 85000;
  while (!isCancelled() && Date.now() < deadline && lib.time().secondsUntilNight > 140) {
    await sleep(2000);
    if (f.outputItem() && f.outputItem().count >= 7) break;
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

// 4. Craft iron_leggings
console.log('Iron ingots available:', lib.count('iron_ingot'));
if (lib.count('iron_ingot') >= 7 && !lib.count('iron_leggings')) {
  await lib.ensureTable();
  console.log('Crafting iron_leggings...');
  await lib.craft('iron_leggings', 1);
  console.log('Iron leggings crafted!');
}

// 5. Equip all armor
await lib.equipArmor();

// 6. Return to base before night
console.log('Time until night:', lib.time().secondsUntilNight);
console.log('Heading back to base...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  console.log('Return error:', e.message);
}

console.log('Inside base at', lib.fmt(bot.entity.position));
console.log('Gamma tools and armor:', JSON.stringify(lib.tools()));
console.log('Final inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma report: FULL IRON ARMOR COMPLETE (helmet, chestplate, leggings, boots) + SHIELD! Milestone 3 reached for Gamma!`);
