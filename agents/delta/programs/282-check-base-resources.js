// programs/282-check-base-resources.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// Check furnace at (295, 72, -56)
try {
  const fBlock = bot.blockAt(new Vec3(295, 72, -56));
  if (fBlock && fBlock.name.includes('furnace')) {
    const f = await bot.openFurnace(fBlock);
    console.log(`Furnace (295, 72, -56): input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
    f.close();
  } else {
    console.log(`Block at (295, 72, -56) is ${fBlock?.name}`);
  }
} catch (e) {
  console.log(`Furnace error: ${e.message}`);
}

// Find nearby logs
const logs = bot.findBlocks({
  matching: b => b.name.includes('_log'),
  maxDistance: 25,
  count: 5
});
console.log(`Nearby logs count: ${logs.length}`);
for (const l of logs) {
  console.log(`  Log at ${lib.fmt(l)} (${bot.blockAt(l).name})`);
}

// Check base door position
const doors = bot.findBlocks({
  matching: b => b.name.includes('door'),
  maxDistance: 10,
  count: 5
});
console.log(`Doors count: ${doors.length}`);
for (const d of doors) {
  console.log(`  Door at ${lib.fmt(d)}`);
}

// Check inventory
console.log('Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
