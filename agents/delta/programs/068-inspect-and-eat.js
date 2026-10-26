// programs/068-inspect-and-eat.js
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// Players nearby
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
  }
}

// Check chest
const chestPos = new Vec3(293, 72, -57);
let chest = {};
try {
  chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest read failed:', e.message);
}

// Check furnaces
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 8, count: 5 });
console.log(`Found ${furnaces.length} furnaces`);
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    const inItem = fw.inputItem();
    const outItem = fw.outputItem();
    const fuelItem = fw.fuelItem();
    console.log(`Furnace at ${lib.fmt(f)}: in=${inItem?.name}x${inItem?.count} out=${outItem?.name}x${outItem?.count} fuel=${fuelItem?.name}x${fuelItem?.count}`);
    if (outItem && outItem.count > 0) {
      await fw.takeOutput();
      console.log(`Took output: ${outItem.name} x${outItem.count}`);
    }
    await fw.close();
  } catch (err) {
    console.log(`Furnace at ${lib.fmt(f)} error:`, err.message);
  }
}

// Food check and eat
const foodKeys = ['cooked_beef', 'cooked_chicken', 'cooked_porkchop', 'cooked_mutton', 'bread', 'baked_potato', 'apple', 'cooked_cod', 'cooked_salmon', 'sweet_berries', 'beef', 'chicken', 'porkchop', 'mutton', 'rotten_flesh'];

for (const fk of foodKeys) {
  if (chest[fk] && chest[fk] > 0) {
    const takeCount = Math.min(chest[fk], 5);
    console.log(`Withdrawing ${takeCount} ${fk} to eat...`);
    await lib.withdraw({ [fk]: takeCount }, chestPos.x, chestPos.y, chestPos.z);
    break;
  }
}

// Eat if we have food
for (const fk of foodKeys) {
  while (lib.count(fk) > 0 && bot.food < 20) {
    console.log(`Eating ${fk}, current food: ${bot.food}`);
    await lib.eat();
    await sleep(500);
  }
}

console.log('After eating: Health:', bot.health, 'Food:', bot.food);
console.log('Delta inventory:', JSON.stringify(lib.inv()));
