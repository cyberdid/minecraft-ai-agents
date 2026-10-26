// programs/220-check-furnaces-and-beta.js
console.log('=== Program 220: Check Furnaces, Chest & Coordinate with Beta ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Enter base if outside
try {
  if (bot.entity.position.distanceTo(new Vec3(294, 72, -55)) > 3) {
    await lib.goTo(294, 72, -52, 1, { timeoutMs: 15000 });
    if (typeof passDoorIn === 'function') await passDoorIn();
    else await lib.goThroughDoor(294, 72, -54);
  }
} catch (e) {
  console.log('Enter base note:', e.message);
}

// 2. Check all 3 base furnaces
const furnaceSpots = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const spot of furnaceSpots) {
  const blk = bot.blockAt(spot);
  if (blk && blk.name.includes('furnace')) {
    try {
      const furn = await bot.openFurnace(blk);
      console.log(`Furnace at ${lib.fmt(spot)}: input=${furn.inputItem()?.name}x${furn.inputItem()?.count}, fuel=${furn.fuelItem()?.name}x${furn.fuelItem()?.count}, output=${furn.outputItem()?.name}x${furn.outputItem()?.count}`);
      if (furn.outputItem()) {
        await furn.takeOutput();
        console.log(`  Took output: ${furn.outputItem()?.name}`);
      }
      furn.close();
    } catch (e) {
      console.log(`Error reading furnace at ${lib.fmt(spot)}:`, e.message);
    }
  }
}

// 3. Check chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Base chest contents:', JSON.stringify(contents));
  // If there are iron ingots or raw iron in chest, withdraw
  if (contents.iron_ingot) {
    await lib.withdraw({ iron_ingot: contents.iron_ingot }, chestPos.x, chestPos.y, chestPos.z);
  }
  // Withdraw food if available
  if (contents.cooked_mutton) {
    await lib.withdraw({ cooked_mutton: contents.cooked_mutton }, chestPos.x, chestPos.y, chestPos.z);
  }
} catch (e) {
  console.log('Chest read error:', e.message);
}

console.log('Alpha inventory now:', JSON.stringify(lib.inv()));

// 4. Check Beta
if (bot.players.beta) {
  const b = bot.players.beta.entity;
  console.log('Beta pos:', b ? lib.fmt(b.position) : 'unknown', 'held:', b?.heldItem?.name);
}

bot.chat('beta: In base checking iron and supplies. What is your inventory status? Did you recover the diamond pickaxe?');
