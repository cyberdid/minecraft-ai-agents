// programs/042-pack-iron-and-base-smelt.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Check nearby furnace and retrieve items
const fBlock = bot.findBlock({ matching: b => b.name === 'furnace', maxDistance: 12 });
if (fBlock) {
  console.log('Found furnace at', lib.fmt(fBlock.position));
  try {
    const f = await bot.openFurnace(fBlock);
    if (f.outputItem()) {
      console.log('Took smelted output:', f.outputItem().name, 'x' + f.outputItem().count);
      await f.takeOutput();
    }
    if (f.inputItem()) await f.takeInput();
    if (f.fuelItem()) await f.takeFuel();
    f.close();
  } catch (e) {
    console.log('Furnace retrieval error:', e.message);
  }
  try {
    await lib.dig(fBlock.position.x, fBlock.position.y, fBlock.position.z);
    await lib.pickup(4);
  } catch (e) {}
}

console.log('Inventory before heading to base:', JSON.stringify(lib.inv()));
bot.chat(`gamma heading to base with ${lib.count('raw_iron')} raw_iron and ${lib.count('iron_ingot')} iron_ingots for parallel base smelting!`);

// 2. Return to base in 2 safe stages
console.log('Stage 1: towards (350, 65, 10)...');
try {
  await lib.goTo(350, 65, 10, 3, { dig: true });
} catch (e) {
  console.log('Stage 1 error:', e.message);
}

console.log('Stage 2: towards base door (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  console.log('Stage 2 error:', e.message);
}

console.log('Inside base at', lib.fmt(bot.entity.position));
console.log('Time until night:', lib.time().secondsUntilNight);
console.log('Final inventory:', JSON.stringify(lib.inv()));
