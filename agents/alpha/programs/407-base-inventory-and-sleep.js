// programs/407-base-inventory-and-sleep.js
console.log('=== Program 407: Base Inventory Check & Sleep ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

// 1. Check all nearby furnaces
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const pos of furnacePositions) {
  const bl = bot.blockAt(pos);
  if (bl && bl.name === 'furnace') {
    try {
      console.log(`Checking furnace at ${lib.fmt(pos)}...`);
      const furnace = await bot.openFurnace(bl);
      const input = furnace.inputItem();
      const fuel = furnace.fuelItem();
      const output = furnace.outputItem();
      console.log(`Furnace at ${lib.fmt(pos)}:`, {
        input: input ? `${input.name}x${input.count}` : null,
        fuel: fuel ? `${fuel.name}x${fuel.count}` : null,
        output: output ? `${output.name}x${output.count}` : null
      });
      if (output) {
        console.log(`Taking output ${output.name}x${output.count}...`);
        await furnace.takeOutput();
      }
      furnace.close();
    } catch (e) {
      console.log(`Furnace ${lib.fmt(pos)} error:`, e.message);
    }
  }
}

// 2. Search for any chests nearby
const chests = bot.findBlocks({
  matching: mcData.blocksByName.chest.id,
  maxDistance: 16,
  count: 10
});
console.log(`Found ${chests.length} chest(s) in/near base.`);
for (const cPos of chests) {
  try {
    const contents = await lib.chestContents(cPos.x, cPos.y, cPos.z);
    console.log(`Chest at ${lib.fmt(cPos)}:`, JSON.stringify(contents));
  } catch (e) {
    console.log(`Chest ${lib.fmt(cPos)} read error:`, e.message);
  }
}

// 3. Check time and sleep
const t = lib.time();
console.log(`Time: ${t.timeOfDay} (${t.phase}), canSleep: ${t.canSleep}`);

if (t.canSleep) {
  bot.chat('team: Alpha sleeping in bed to skip night! Beta & Gamma please sleep too!');
  try {
    console.log('Calling lib.sleepInBed()...');
    const res = await lib.sleepInBed();
    console.log('sleepInBed result:', res);
    // Wait up to 10 seconds while sleeping
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      if (!bot.isSleeping) break;
    }
    console.log('Woke up! Time now:', lib.time().timeOfDay);
  } catch (e) {
    console.log('sleep note:', e.message);
  }
}

// 4. Report current inventory and status
console.log('Alpha current inventory:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
