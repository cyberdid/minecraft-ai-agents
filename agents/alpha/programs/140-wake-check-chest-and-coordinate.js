// programs/140-wake-check-chest-and-coordinate.js
console.log('--- Waking up and checking base inventory ---');
try {
  await bot.wake();
  console.log('Woke up.');
} catch (e) {
  console.log('Wake note:', e.message);
}

// Make sure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// Check where Beta is
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== bot.username) {
    console.log(`Player ${name} is at ${lib.fmt(p.entity.position)}`);
  }
}

// Check base chest
let chest = {};
try {
  chest = await lib.chestContents();
  console.log('Base chest contents:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest error:', e.message);
}

// Check furnaces
const furnaces = [new Vec3(295, 72, -54), new Vec3(295, 72, -55), new Vec3(295, 72, -56)];
for (const f of furnaces) {
  const blk = bot.blockAt(f);
  if (blk && blk.name.includes('furnace')) {
    try {
      const furn = await bot.openFurnace(blk);
      console.log(`Furnace at ${lib.fmt(f)}: in=${furn.inputItem()?.name}x${furn.inputItem()?.count}, fuel=${furn.fuelItem()?.name}x${furn.fuelItem()?.count}, out=${furn.outputItem()?.name}x${furn.outputItem()?.count}`);
      if (furn.outputItem()) await furn.takeOutput();
      furn.close();
    } catch (e) {
      console.log(`Furnace ${lib.fmt(f)} error:`, e.message);
    }
  }
}

// Check beds
const bedBlocks = bot.findBlocks({ matching: b => b.name.includes('bed'), maxDistance: 16 });
console.log('Found beds:', bedBlocks.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

console.log('Alpha inventory:', JSON.stringify(lib.inv()));
console.log('Time:', lib.time().timeOfDay, '| night in:', lib.time().secondsUntilNight, '| Phase:', lib.time().phase);

// Chat with Beta
bot.chat(`alpha: Woke up. Night ${lib.time().phase}. Checking chest and supplies.`);
