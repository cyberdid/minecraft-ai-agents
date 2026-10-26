// programs/025-mine-iron-and-smelt.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Mine nearby iron ores
const ironTargets = [
  new Vec3(402, 70, 54),
  new Vec3(401, 69, 53)
];

for (const p of ironTargets) {
  const b = bot.blockAt(p);
  if (b && b.name.includes('iron_ore')) {
    console.log(`Mining iron ore at ${lib.fmt(p)}...`);
    try {
      await lib.goTo(p.x, p.y, p.z, 2, { dig: true });
      await lib.dig(p.x, p.y, p.z);
      await lib.pickup(4);
    } catch (e) {
      console.log('Mine iron error:', e.message);
    }
  }
}

// Find more iron within 16 blocks
const moreIron = bot.findBlocks({ matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore', maxDistance: 16, count: 8 });
console.log(`Found ${moreIron.length} more iron nearby:`, moreIron.map(p => lib.fmt(p)));

for (const p of moreIron) {
  if (isCancelled() || lib.time().secondsUntilNight < 180) break;
  try {
    await lib.goTo(p.x, p.y, p.z, 2, { dig: true });
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
  } catch (e) {
    console.log(`Mine iron at ${lib.fmt(p)} error:`, e.message);
  }
}

console.log('Mined iron! raw_iron count:', lib.count('raw_iron'));

// 2. Smelt chicken and raw_iron
if (lib.count('chicken') > 0 || lib.count('raw_iron') > 0) {
  console.log('Setting up portable furnace to cook/smelt...');
  const spot = await lib.freeSpot();
  await lib.place('furnace', spot.x, spot.y, spot.z);
  const fBl = bot.blockAt(spot);
  const f = await bot.openFurnace(fBl);

  // First cook chicken if any
  if (lib.count('chicken') > 0) {
    const ch = bot.inventory.items().find(i => i.name === 'chicken');
    await f.putInput(ch.type, null, ch.count);
    const coalItem = bot.inventory.items().find(i => i.name === 'coal');
    await f.putFuel(coalItem.type, null, 1);
    console.log('Cooking chicken...');
    const deadline = Date.now() + 25000;
    while (!isCancelled() && Date.now() < deadline) {
      await sleep(1000);
      if (f.outputItem() && f.outputItem().count >= ch.count) break;
    }
    if (f.outputItem()) await f.takeOutput();
  }

  // Next smelt raw_iron if any
  if (lib.count('raw_iron') > 0) {
    const raw = bot.inventory.items().find(i => i.name === 'raw_iron');
    await f.putInput(raw.type, null, raw.count);
    if (!f.fuelItem()) {
      const coalItem = bot.inventory.items().find(i => i.name === 'coal');
      if (coalItem) await f.putFuel(coalItem.type, null, 1);
    }
    console.log(`Smelting ${raw.count} raw_iron...`);
    const deadline = Date.now() + (raw.count * 12000 + 5000);
    while (!isCancelled() && Date.now() < deadline) {
      await sleep(1000);
      if (f.outputItem() && f.outputItem().count >= raw.count) break;
    }
    if (f.outputItem()) await f.takeOutput();
  }

  f.close();
  await lib.dig(spot.x, spot.y, spot.z);
  await lib.pickup(4);
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Time until night:', lib.time().secondsUntilNight);
bot.chat(`gamma status: iron_ingots=${lib.count('iron_ingot')}, cooked_chicken=${lib.count('cooked_chicken')}, coal=${lib.count('coal')}`);
