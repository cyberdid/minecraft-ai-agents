// programs/049-check-iron-and-smelt.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Inspect base furnaces
const fPositions = [new Vec3(295, 72, -55), new Vec3(295, 72, -57)];
let totalIngotsInFurnaces = 0;

for (const pos of fPositions) {
  const bl = bot.blockAt(pos);
  if (!bl || bl.name !== 'furnace') continue;
  try {
    const f = await bot.openFurnace(bl);
    console.log(`Furnace at ${lib.fmt(pos)}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
    if (f.outputItem() && f.outputItem().name === 'iron_ingot') {
      totalIngotsInFurnaces += f.outputItem().count;
      await f.takeOutput();
    }
    // If input is raw_iron and no fuel, fuel it with coal!
    if (f.inputItem() && f.inputItem().name === 'raw_iron' && !f.fuelItem() && lib.count('coal') > 0) {
      const coal = bot.inventory.items().find(i => i.name === 'coal');
      if (coal) {
        await f.putFuel(coal.type, null, 2);
        console.log(`Fueled furnace at ${lib.fmt(pos)} with coal!`);
      }
    }
    f.close();
  } catch (e) {
    console.log(`Furnace at ${lib.fmt(pos)} err:`, e.message);
  }
}

// 2. Check base chest
const chest = await lib.chestContents(293, 72, -57);
console.log('Base chest items:', JSON.stringify(chest));

if (chest.raw_iron) {
  console.log(`Found ${chest.raw_iron} raw_iron in chest! Withdrawing to smelt...`);
  await lib.withdraw({ raw_iron: chest.raw_iron }, 293, 72, -57);
}
if (chest.iron_ingot) {
  console.log(`Found ${chest.iron_ingot} iron_ingot in chest! Withdrawing...`);
  await lib.withdraw({ iron_ingot: chest.iron_ingot }, 293, 72, -57);
}

// 3. If we withdrew raw_iron, put it into furnace 1
if (lib.count('raw_iron') > 0) {
  const f1 = bot.blockAt(new Vec3(295, 72, -55));
  if (f1) {
    try {
      const f = await bot.openFurnace(f1);
      const raw = bot.inventory.items().find(i => i.name === 'raw_iron');
      if (raw) await f.putInput(raw.type, null, raw.count);
      if (!f.fuelItem() && lib.count('coal') > 0) {
        const coal = bot.inventory.items().find(i => i.name === 'coal');
        if (coal) await f.putFuel(coal.type, null, 2);
      }
      f.close();
      console.log(`Put ${raw.count} raw_iron into base furnace 1 to smelt!`);
    } catch (e) {}
  }
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// 4. Craft iron_leggings if 7 ingots available
if (lib.count('iron_ingot') >= 7 && !lib.count('iron_leggings')) {
  await lib.ensureTable();
  console.log('Crafting iron_leggings...');
  await lib.craft('iron_leggings', 1);
  await lib.equipArmor();
  console.log('IRON LEGGINGS EQUIPPED!');
}

console.log('Gear now:', JSON.stringify(lib.tools()));
console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`gamma check: furnaces fueled and monitored. Wearing: ${JSON.stringify(lib.tools())}`);
