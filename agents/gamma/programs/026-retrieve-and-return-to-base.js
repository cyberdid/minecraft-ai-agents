// programs/026-retrieve-and-return-to-base.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Find and retrieve from nearby furnace
const fBlock = bot.findBlock({ matching: b => b.name === 'furnace', maxDistance: 10 });
if (fBlock) {
  console.log('Found furnace at', lib.fmt(fBlock.position));
  try {
    const f = await bot.openFurnace(fBlock);
    // Wait briefly if smelting is in progress
    let waitRounds = 0;
    while ((f.inputItem() || f.fuelItem()) && waitRounds < 15 && !isCancelled()) {
      await sleep(1000);
      waitRounds++;
      if (f.outputItem() && !f.inputItem()) break;
    }
    if (f.outputItem()) {
      console.log('Took output:', f.outputItem().name, 'x' + f.outputItem().count);
      await f.takeOutput();
    }
    if (f.inputItem()) await f.takeInput();
    if (f.fuelItem()) await f.takeFuel();
    f.close();
  } catch (e) {
    console.log('Furnace access error:', e.message);
  }

  // Dig furnace back
  try {
    await lib.dig(fBlock.position.x, fBlock.position.y, fBlock.position.z);
    await lib.pickup(4);
  } catch (e) {
    console.log('Dig furnace error:', e.message);
  }
} else {
  console.log('No furnace found nearby');
}

console.log('Inventory before heading back:', JSON.stringify(lib.inv()));
bot.chat('gamma returning to base with iron and supplies!');

// 2. Return to base in 3 safe stages
console.log('Stage 1: towards (350, 65, 10)...');
try {
  await lib.goTo(350, 65, 10, 3, { dig: true });
} catch (e) {
  console.log('Stage 1 err:', e.message);
}

console.log('Stage 2: towards (310, 71, -30)...');
try {
  await lib.goTo(310, 71, -30, 3, { dig: true });
} catch (e) {
  console.log('Stage 2 err:', e.message);
}

console.log('Stage 3: towards base door (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  // Enter base
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  console.log('Stage 3 err:', e.message);
}

console.log('Inside base at', lib.fmt(bot.entity.position));
console.log('Night in:', lib.time().secondsUntilNight);
console.log('Final inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma safely at base! night in: ${lib.time().secondsUntilNight}s. Inv: ${JSON.stringify(lib.inv())}`);
