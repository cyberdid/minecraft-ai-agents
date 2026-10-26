// programs/308-furnace-flint-and-chest.js
console.log('=== Inside base: extract flint, check furnaces and chest ===');

// 1. Check time and sleep if possible
const t = lib.time();
console.log(`Time: ${t.timeOfDay}, canSleep: ${t.canSleep}, night in: ${t.secondsUntilNight}`);

// 2. Check chest contents
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems().map(i => `${i.name}x${i.count}`);
    console.log('Chest items:', items.join(', ') || 'empty');
    chest.close();
  } catch (e) {
    console.log('Chest note:', e.message);
  }
}

// 3. Check Furnace 1 (295, 72, -55)
const f1Block = bot.blockAt(new Vec3(295, 72, -55));
if (f1Block) {
  try {
    const f1 = await bot.openFurnace(f1Block);
    const input = f1.inputItem();
    const fuel = f1.fuelItem();
    const output = f1.outputItem();
    console.log(`F1: input=${input ? `${input.name}x${input.count}` : 'none'}, fuel=${fuel ? `${fuel.name}x${fuel.count}` : 'none'}, output=${output ? `${output.name}x${output.count}` : 'none'}, progress=${f1.progress}`);
    if (output && output.count > 0) {
      await f1.takeOutput();
      console.log(`Took output from F1: ${output.name}x${output.count}`);
    }
    f1.close();
  } catch (e) {
    console.log('F1 note:', e.message);
  }
}

// 4. Extract flint from gravel
// Floor spot inside base: (293, 72, -55)
const spot = new Vec3(293, 72, -55);
let tries = 0;
while (lib.count('flint') === 0 && lib.count('gravel') > 0 && tries < 25 && !isCancelled()) {
  tries++;
  const cur = bot.blockAt(spot);
  if (!cur || cur.name === 'air') {
    await lib.place('gravel', spot.x, spot.y, spot.z);
  }
  const blk = bot.blockAt(spot);
  if (blk && blk.name === 'gravel') {
    await lib.dig(spot.x, spot.y, spot.z);
    await lib.pickup(3);
  }
  await sleep(100);
}
console.log(`Flint on beta: ${lib.count('flint')}, gravel left: ${lib.count('gravel')}`);

// 5. Check if we can sleep
if (lib.time().canSleep) {
  console.log('Attempting sleep at Bed 1 (294, 72, -56)...');
  try {
    const bed = bot.findBlock({ matching: b => b.name.endsWith('_bed'), maxDistance: 4 });
    if (bed) {
      await bot.sleep(bed);
      console.log('In bed sleeping!');
    }
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: At base. Flint: ${lib.count('flint')}, Iron: ${lib.count('iron_ingot')}. Waiting for morning.`);
