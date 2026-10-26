// programs/463-check-both-furnaces.js
console.log('=== Step: Check Furnaces from current position ===');
console.log('Pos:', lib.fmt(bot.entity.position));

const f1Pos = new Vec3(295, 72, -55);
const f2Pos = new Vec3(295, 72, -57);

async function checkFurnace(pos, name) {
  const b = bot.blockAt(pos);
  if (!b) return;
  try {
    await bot.lookAt(pos.offset(0.5, 0.5, 0.5));
    const f = await bot.openFurnace(b);
    console.log(`${name} at ${lib.fmt(pos)}:`);
    console.log(`  input:`, f.inputItem()?.name, f.inputItem()?.count);
    console.log(`  fuel: `, f.fuelItem()?.name, f.fuelItem()?.count);
    console.log(`  output:`, f.outputItem()?.name, f.outputItem()?.count);
    if (f.outputItem()) {
      await f.takeOutput();
      console.log(`  Took output from ${name}!`);
    }
    f.close();
  } catch (e) {
    console.log(`Error on ${name}:`, e.message);
  }
}

await checkFurnace(f1Pos, 'Furnace 1');
await checkFurnace(f2Pos, 'Furnace 2');

console.log('Inventory after harvest:', JSON.stringify(lib.inv()));
