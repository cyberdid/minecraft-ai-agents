// programs/132-inspect-furnaces-and-beds.js
console.log('--- INSPECT FURNACES, BEDS, AND TEAM ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Inspect furnaces at (295, 72, -54), (295, 72, -55), (295, 72, -56)
const furnaceCoords = [
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -56)
];

for (const fpos of furnaceCoords) {
  const fb = bot.blockAt(fpos);
  console.log(`Block at ${lib.fmt(fpos)}: ${fb ? fb.name : 'null'}`);
  if (fb && fb.name.includes('furnace')) {
    try {
      const furnace = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fpos)}: input=${furnace.inputItem() ? furnace.inputItem().name + 'x' + furnace.inputItem().count : 'empty'}, fuel=${furnace.fuelItem() ? furnace.fuelItem().name + 'x' + furnace.fuelItem().count : 'empty'}, output=${furnace.outputItem() ? furnace.outputItem().name + 'x' + furnace.outputItem().count : 'empty'}`);
      
      // Take output if any
      if (furnace.outputItem()) {
        await furnace.takeOutput();
        console.log(`Took output from furnace at ${lib.fmt(fpos)}`);
      }
      furnace.close();
    } catch (e) {
      console.log(`Error opening furnace at ${lib.fmt(fpos)}:`, e.message);
    }
  }
}

// 2. Check beds at (294, 72, -55) and (293, 72, -56)
const bedBlocks = bot.findBlocks({
  matching: b => b.name.includes('bed'),
  maxDistance: 6,
  count: 5
});
console.log(`Found ${bedBlocks.length} beds:`, bedBlocks.map(b => lib.fmt(b)).join(', '));

// 3. Check teammate status and chat
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Player ${name} at: ${lib.fmt(p.entity.position)} dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}m`);
  }
}

bot.chat('gamma at base base camp. Alpha, Delta, let us re-arm with stone tools and cobblestone before heading back to Nether!');
console.log('Inv:', JSON.stringify(lib.inv()));
