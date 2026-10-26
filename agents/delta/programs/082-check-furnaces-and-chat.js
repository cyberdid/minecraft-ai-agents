// programs/082-check-furnaces-and-chat.js
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Check furnaces
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    const inI = fw.inputItem();
    const outI = fw.outputItem();
    const fuelI = fw.fuelItem();
    console.log(`Furnace at ${lib.fmt(f)}: in=${inI?.name}x${inI?.count} out=${outI?.name}x${outI?.count} fuel=${fuelI?.name}x${fuelI?.count}`);
    if (outI && outI.count > 0) {
      await fw.takeOutput();
      console.log(`Took ${outI.count} ${outI.name}!`);
    }
    await fw.close();
  } catch (err) {
    console.log(`Furnace check err:`, err.message);
  }
}

// 2. Check chest
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(contents));
  if (contents.iron_ingot) {
    await lib.withdraw({ iron_ingot: contents.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
    console.log(`Withdrew ${contents.iron_ingot} iron ingots from chest!`);
  }
} catch (e) {
  console.log('Chest check err:', e.message);
}

console.log('Delta iron ingots:', lib.count('iron_ingot'));

// 3. Ask Beta and Alpha about raw iron / mining
bot.chat('delta: Beta, do you have raw iron to smelt? Delta has shield ready and is ready to mine or craft boots/helmet!');
