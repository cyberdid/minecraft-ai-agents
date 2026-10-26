// programs/105-inspect-and-check-food.js
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Inspect blocks in 3x3x3 around Delta
for (let dx = -1; dx <= 1; dx++) {
  for (let dy = 0; dy <= 2; dy++) {
    for (let dz = -1; dz <= 1; dz++) {
      const p = bot.entity.position.offset(dx, dy, dz).floored();
      const b = bot.blockAt(p);
      if (b && b.name !== 'air') {
        console.log(`Block at ${lib.fmt(p)}: ${b.name}`);
      }
    }
  }
}

// 2. Check base chest for any edible items
const chestPos = new Vec3(293, 72, -57);
try {
  const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest err:', e.message);
}

// 3. Check furnaces for any food or smelted items
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 10, count: 5 });
console.log(`Found ${furnaces.length} furnaces`);
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    const inI = fw.inputItem();
    const outI = fw.outputItem();
    console.log(`Furnace at ${lib.fmt(f)}: in=${inI?.name}x${inI?.count} out=${outI?.name}x${outI?.count}`);
    if (outI && outI.count > 0) {
      await fw.takeOutput();
      console.log(`Took ${outI.count} ${outI.name}!`);
    }
    await fw.close();
  } catch (err) {}
}

// 4. Scan for animals within 48 blocks
const animals = [];
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (e && ['cow', 'sheep', 'pig', 'chicken'].includes(e.name)) {
    const d = Math.round(bot.entity.position.distanceTo(e.position));
    animals.push({ name: e.name, pos: lib.fmt(e.position), dist: d });
  }
}
console.log(`Animals nearby:`, JSON.stringify(animals));
bot.chat(`delta: Checking food and portal route to relieve Alpha & Gamma at Fortress!`);
