// programs/125-enter-base-and-check.js
// 1. Step through door into base
// 2. Check furnaces at (295, 72, -55) and (295, 72, -57) for smelted iron
// 3. Ask Beta for any spare food or search for apples

console.log('alpha at:', lib.fmt(bot.entity.position));

// 1. Enter base
await passDoorIn();
console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 2. Check both furnaces
for (const p of [new Vec3(295, 72, -55), new Vec3(295, 72, -57)]) {
  const bl = bot.blockAt(p);
  if (bl && bl.name === 'furnace') {
    try {
      const f = await bot.openFurnace(bl);
      console.log(`Furnace at ${p}: input=${f.inputItem()?.name} x${f.inputItem()?.count}, output=${f.outputItem()?.name} x${f.outputItem()?.count}`);
      if (f.outputItem() && f.outputItem().name === 'iron_ingot') {
        console.log(`Taking ${f.outputItem().count} iron_ingot from ${p}...`);
        await f.takeOutput();
      }
      f.close();
    } catch (e) {
      console.log(`Furnace ${p} note:`, e.message);
    }
  }
}

console.log('Alpha inventory now:', JSON.stringify(lib.inv()));
bot.chat('alpha: Inside base! Checking furnaces. Does anyone have an apple or meat? My food is 3.');
