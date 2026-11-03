// programs/432-check-furnaces.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

const furnaceCoords = [
  { x: 295, y: 72, z: -55 },
  { x: 295, y: 72, z: -54 },
  { x: 295, y: 72, z: -56 }
];

for (const c of furnaceCoords) {
  const b = bot.blockAt(new Vec3(c.x, c.y, c.z));
  console.log(`Block at ${c.x}, ${c.y}, ${c.z}:`, b?.name);
  if (b && (b.name === 'furnace' || b.name === 'lit_furnace')) {
    try {
      const f = await bot.openFurnace(b);
      console.log(`Furnace at ${c.x}, ${c.y}, ${c.z}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      if (f.outputItem()) {
        await f.takeOutput();
        console.log('Took output from furnace!');
      }
      f.close();
    } catch (e) {
      console.log(`Failed opening furnace at ${c.x}, ${c.y}, ${c.z}:`, e.message);
    }
  }
}

// Check other chests nearby
const chestIds = [mcData.blocksByName.chest?.id, mcData.blocksByName.trapped_chest?.id].filter(Boolean);
const chests = bot.findBlocks({ matching: chestIds, maxDistance: 12, count: 5 });
console.log(`Found ${chests.length} chests nearby:`);
for (const c of chests) {
  try {
    const contents = await lib.chestContents(c.x, c.y, c.z);
    console.log(`Chest at ${lib.fmt(c)}:`, JSON.stringify(contents));
  } catch (e) {
    console.log(`Chest at ${lib.fmt(c)} error:`, e.message);
  }
}

console.log('Delta inventory:');
for (const item of bot.inventory.items()) console.log(`  ${item.name} x${item.count}`);
