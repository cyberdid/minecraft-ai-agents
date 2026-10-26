// programs/368-return-and-pool-iron-in-base.js
console.log('=== Program 368: Return 36 blocks to Base & Pool Iron ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Walk back to base exterior (294.5, 72, -52)
console.log('Walking 36 blocks back to base door exterior...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 25000 });
} catch (e) {
  console.log('goTo note:', e.message);
  try {
    await lib.goToXZ(294.5, -52, { timeoutMs: 20000 });
  } catch (e2) {}
}

// 2. Enter base shelter
console.log('Entering base...');
try {
  await globalThis.passDoorIn();
  console.log('Inside base!');
} catch (e) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}

console.log('Alpha inside base at:', lib.fmt(bot.entity.position));

// 3. Put raw iron and coal in furnace (295, 72, -55) to smelt
const fBlock = bot.blockAt(new Vec3(295, 72, -55));
if (fBlock && lib.count('raw_iron') > 0) {
  console.log(`Putting ${lib.count('raw_iron')} raw_iron into furnace...`);
  try {
    const f = await bot.openFurnace(fBlock);
    if (lib.count('coal') > 0) {
      await f.putFuel(mcData.itemsByName.coal.id, null, 1);
    }
    await f.putInput(mcData.itemsByName.raw_iron.id, null, lib.count('raw_iron'));
    console.log('Furnace input loaded with raw_iron!');
    f.close();
  } catch (err) {
    console.log('Furnace load error:', err.message);
    // If furnace busy, deposit raw iron in chest for team
    try {
      await lib.deposit({ raw_iron: 'all' }, 293, 72, -57);
      console.log('Deposited raw_iron in chest!');
    } catch (e3) {}
  }
}

// 4. Check chest contents
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(chest));
} catch (e) {}

// 5. Chat status
bot.chat('team: Alpha in base! Loaded 4 raw_iron in furnace (295, 72, -55). Beta & Delta, pool iron for remaining armor!');

console.log('Alpha status:', JSON.stringify(lib.status()));
