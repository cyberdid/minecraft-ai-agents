// programs/021-check-furnaces-and-chest.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// Step into base
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  await bot.activateBlock(door);
  await sleep(200);
}
await lib.walkTo(294, -56);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
}

// Check both furnaces
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  const fb = bot.blockAt(f);
  try {
    const furnaceWindow = await bot.openFurnace(fb);
    console.log(`Furnace at ${lib.fmt(f)}:`);
    console.log(`  input:`, furnaceWindow.inputItem());
    console.log(`  fuel:`, furnaceWindow.fuelItem());
    console.log(`  output:`, furnaceWindow.outputItem());
    
    // If there is an output item, take it!
    if (furnaceWindow.outputItem()) {
      await furnaceWindow.takeOutput();
      console.log('  Took output from furnace!');
    }
    await furnaceWindow.close();
  } catch (err) {
    console.log(`Furnace at ${lib.fmt(f)} inspect error:`, err.message);
  }
}

// Step back outside to portal site
if (door && !bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
await lib.walkTo(298, -52);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
}

console.log('Inv now:', JSON.stringify(lib.inv()));
// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}
