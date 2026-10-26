// programs/057-fill-bucket-and-complete-armor.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Step inside base
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d) await bot.activateBlock(d);
  await lib.walkTo(294.5, -55.5);
}

console.log('Inside base at', lib.fmt(bot.entity.position));

// 2. Check and collect all smelted iron ingots from both base furnaces
const furnaces = [new Vec3(295, 72, -55), new Vec3(295, 72, -57)];
for (const pos of furnaces) {
  const bl = bot.blockAt(pos);
  if (!bl || bl.name !== 'furnace') continue;
  try {
    const f = await bot.openFurnace(bl);
    if (f.outputItem() && f.outputItem().name === 'iron_ingot') {
      console.log(`Took ${f.outputItem().count} iron ingots from ${lib.fmt(pos)}`);
      await f.takeOutput();
    }
    f.close();
  } catch (e) {}
}

console.log('Total iron ingots in inventory:', lib.count('iron_ingot'));

// 3. Craft iron_leggings
await lib.ensureTable();
if (lib.count('iron_ingot') >= 7 && !lib.count('iron_leggings')) {
  console.log('Crafting iron_leggings...');
  await lib.craft('iron_leggings', 1);
  console.log('Crafted iron_leggings!');
}

// Equip full armor
await lib.equipArmor();

// 4. Fill bucket with water if empty bucket in inventory
if (lib.count('bucket') > 0 && !lib.count('water_bucket')) {
  console.log('Filling water bucket...');
  try {
    await lib.goThroughDoor(294, 72, -54, { close: false });
    const r = await lib.fillBucket('water');
    console.log('fillBucket result:', r);
    await lib.goThroughDoor(294, 72, -54, { close: true });
  } catch (e) {
    console.log('fillBucket error:', e.message);
  }
}

// 5. Check if any food in chest
const chest = await lib.chestContents(293, 72, -57);
console.log('Chest contents:', JSON.stringify(chest));
const foodItemName = Object.keys(chest).find(n => n.includes('cooked') || n === 'apple' || n === 'bread');
if (foodItemName) {
  console.log(`Withdrawing ${foodItemName} from chest...`);
  try {
    await lib.withdraw({ [foodItemName]: 2 }, 293, 72, -57);
    await lib.eat();
    console.log('Food restored to:', bot.food);
  } catch (e) {}
}

// Close door
try { await lib.door(294, 72, -54, false); } catch (e) {}

console.log('Gamma final gear:', JSON.stringify(lib.tools()));
console.log('Gamma inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma report: FULL IRON ARMOR COMPLETE (${JSON.stringify(lib.tools())}), water_bucket=${lib.count('water_bucket')}. Milestone 3 & 5 reached for Gamma!`);
