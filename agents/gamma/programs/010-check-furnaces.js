// programs/010-check-furnaces.js
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const pos of furnacePositions) {
  const bl = bot.blockAt(pos);
  if (!bl || bl.name !== 'furnace') {
    console.log(`No furnace at ${lib.fmt(pos)} (found: ${bl ? bl.name : 'null'})`);
    continue;
  }
  try {
    const f = await bot.openFurnace(bl);
    const input = f.inputItem();
    const fuel = f.fuelItem();
    const output = f.outputItem();
    console.log(`Furnace at ${lib.fmt(pos)}:`);
    console.log(`  input: ${input ? input.name + ' x' + input.count : 'empty'}`);
    console.log(`  fuel: ${fuel ? fuel.name + ' x' + fuel.count : 'empty'}`);
    console.log(`  output: ${output ? output.name + ' x' + output.count : 'empty'}`);
    if (output) {
      await f.takeOutput();
      console.log(`  took output: ${output.name} x${output.count}`);
    }
    f.close();
  } catch (e) {
    console.log(`Error inspecting furnace at ${lib.fmt(pos)}:`, e.message);
  }
}

console.log('gamma inventory now:', JSON.stringify(lib.inv()));
