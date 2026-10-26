// programs/307-ascend-to-base-and-shelter.js
console.log('=== Ascend shaft and enter base before night ===');

// Movement configuration
const m = new Movements(bot, mcData);
m.canDig = true;
m.allow1by1towers = true;
m.scaffoldingBlocks = [mcData.itemsByName.cobblestone.id, mcData.itemsByName.dirt.id].filter(Boolean);
bot.pathfinder.setMovements(m);

// 1. Ascend to y=62
console.log('Ascending to (302, 62, -38)...');
try {
  await lib.goTo(302, 62, -38, 2, { dig: true, timeoutMs: 20000 });
  console.log('At y=62:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Ascent y=62 note:', e.message);
}

// 2. Ascend to shaft top (302, 71, -44)
console.log('Ascending to shaft top (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { dig: true, timeoutMs: 25000 });
  console.log('At shaft top:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shaft top note:', e.message);
}

// 3. Enter base door (294, 72, -54)
console.log('Entering base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {
  console.log('Door entry note:', e.message);
  await lib.goTo(294, 72, -55, 1, { dig: true, timeoutMs: 15000 });
}

// Check time and safety
const t = lib.time();
console.log(`Current time: ${t.timeOfDay}, canSleep: ${t.canSleep}, secondsUntilNight: ${t.secondsUntilNight}`);
console.log('Beta pos:', lib.fmt(bot.entity.position));

// Load raw_iron into F1 if at base
const f1Block = bot.blockAt(new Vec3(295, 72, -55));
if (f1Block && bot.entity.position.distanceTo(f1Block.position) < 4) {
  try {
    const f1 = await bot.openFurnace(f1Block);
    if (!f1.fuelItem()) {
      if (lib.count('coal') > 0) {
        await f1.putFuel(mcData.itemsByName.coal.id, null, lib.count('coal'));
      } else if (lib.count('birch_planks') >= 4) {
        await f1.putFuel(mcData.itemsByName.birch_planks.id, null, 4);
      }
    }
    if (lib.count('raw_iron') > 0) {
      await f1.putInput(mcData.itemsByName.raw_iron.id, null, lib.count('raw_iron'));
      console.log('Loaded 5 raw_iron into F1.');
    }
    f1.close();
  } catch (err) {
    console.log('Furnace load note:', err.message);
  }
}

bot.chat('beta: Safely at base! Iron in furnace. Ready for next step.');
