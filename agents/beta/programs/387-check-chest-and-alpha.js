// programs/387-check-chest-and-alpha.js
console.log('=== Step: Inspect chest and furnaces after Alpha returned ===');

const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Chest items now:', items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Check furnace F1 and F2
const fb1 = bot.blockAt(new Vec3(295, 72, -55));
if (fb1) {
  try {
    const f1 = await bot.openFurnace(fb1);
    console.log(`F1: in=${f1.inputItem()?.name}x${f1.inputItem()?.count}, fuel=${f1.fuelItem()?.name}x${f1.fuelItem()?.count}, out=${f1.outputItem()?.name}x${f1.outputItem()?.count}`);
    f1.close();
  } catch (e) {
    console.log('F1 error:', e.message);
  }
}

const fb2 = bot.blockAt(new Vec3(295, 72, -57));
if (fb2) {
  try {
    const f2 = await bot.openFurnace(fb2);
    console.log(`F2: in=${f2.inputItem()?.name}x${f2.inputItem()?.count}, fuel=${f2.fuelItem()?.name}x${f2.fuelItem()?.count}, out=${f2.outputItem()?.name}x${f2.outputItem()?.count}`);
    f2.close();
  } catch (e) {
    console.log('F2 error:', e.message);
  }
}

// Ask Alpha & team about food/meat/iron
bot.chat('beta: Alpha, do you have raw meat or iron to smelt? Base furnaces are ready with coal!');
