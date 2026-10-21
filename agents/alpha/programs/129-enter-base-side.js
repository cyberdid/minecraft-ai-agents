// programs/129-enter-base-side.js
// Enter door at (294, 72, -54) and step to (293.5, 72, -55.5) avoiding the bed at (294, 72, -55)

console.log('alpha at:', lib.fmt(bot.entity.position));

// 1. Open door
await lib.door(294, 72, -54, true);
await sleep(150);

// 2. Walk to (293.5, -55.5)
await lib.walkTo(293.5, -55.5);
console.log('Alpha walked to:', lib.fmt(bot.entity.position));

// 3. Close door
await lib.door(294, 72, -54, false);
console.log('Door closed behind us.');

// 4. Put our 1 raw_iron into the furnace to finish the 4th ingot for Beta's boots!
const f = bot.blockAt(new Vec3(295, 72, -55));
if (f && f.name === 'furnace') {
  try {
    const furnace = await bot.openFurnace(f);
    console.log('Furnace status: input=', furnace.inputItem()?.name, 'fuel=', furnace.fuelItem()?.name, 'output=', furnace.outputItem()?.name);
    if (lib.count('raw_iron') > 0) {
      await furnace.putInput(mcData.itemsByName.raw_iron.id, null, 1);
      console.log('Put 1 raw_iron into furnace!');
    }
    furnace.close();
  } catch (e) {
    console.log('Furnace note:', e.message);
  }
}

bot.chat('alpha: Inside base! Put raw iron in furnace so beta has 4 ingots for iron boots. Milestone 3 almost complete!');
