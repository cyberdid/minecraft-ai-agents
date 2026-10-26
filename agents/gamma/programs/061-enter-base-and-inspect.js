// programs/061-enter-base-and-inspect.js
console.log('Moving towards base door...');
await lib.goTo(294, 72, -53, 1);
console.log('At door exterior. Entering base...');
await lib.goThroughDoor(294, 72, -54);
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 1. Set spawn at bed
try {
  await lib.setSpawn();
  console.log('Spawn point set at bed');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 2. Inspect chest
const chestPos = new Vec3(293, 72, -57);
let chest = {};
try {
  chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Base chest contents:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest inspect error:', e.message);
}

// 3. Inspect furnaces
const furnaceCoords = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const fpos of furnaceCoords) {
  const b = bot.blockAt(fpos);
  if (b && (b.name === 'furnace' || b.name === 'lit_furnace')) {
    try {
      const f = await bot.openFurnace(b);
      console.log(`Furnace at ${lib.fmt(fpos)}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      // If there is output, take it
      if (f.outputItem()) {
        await f.takeOutput();
        console.log(`Took output from furnace at ${lib.fmt(fpos)}`);
      }
      f.close();
    } catch (e) {
      console.log(`Furnace at ${lib.fmt(fpos)} inspect error:`, e.message);
    }
  }
}

bot.chat(`gamma at base: chest=${JSON.stringify(chest)}. Current inv=${JSON.stringify(lib.inv())}`);
