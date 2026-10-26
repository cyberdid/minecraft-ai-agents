// programs/326-inspect-base-resources.js
console.log('=== Program 326: Inspect Base Resources & Furnaces ===');

// Check the 3 furnaces
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

let totalSmeltedIron = 0;

for (let i = 0; i < furnacePositions.length; i++) {
  const p = furnacePositions[i];
  const b = bot.blockAt(p);
  if (!b) continue;
  try {
    const f = await bot.openFurnace(b);
    const inItem = f.inputItem();
    const fuel = f.fuelItem();
    const outItem = f.outputItem();
    console.log(`Furnace #${i+1} at ${lib.fmt(p)}: input=${inItem?.name}x${inItem?.count}, fuel=${fuel?.name}x${fuel?.count}, output=${outItem?.name}x${outItem?.count}`);
    if (outItem && outItem.name === 'iron_ingot') {
      totalSmeltedIron += outItem.count;
      await f.takeOutput();
      console.log(`Withdrew ${outItem.count} iron_ingot from furnace #${i+1}!`);
    }
    f.close();
  } catch (e) {
    console.log(`Furnace #${i+1} error:`, e.message);
  }
}

// Check base chest
const chestPos = new Vec3(293, 72, -57);
try {
  const items = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest items:', JSON.stringify(items));
} catch (e) {
  console.log('Chest error:', e.message);
}

// Check time and sleep readiness
const time = lib.time();
console.log('Time:', JSON.stringify(time));
if (time.canSleep) {
  console.log('Attempting to sleep in Bed 1...');
  try {
    await lib.sleepInBed();
    console.log('Sleeping!');
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}
