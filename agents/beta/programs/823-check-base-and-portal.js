// programs/823-check-base-and-portal.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 823: Inspect Portal Frame & Base Chest ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check exact block at (299, 72, -54)
const missingBlock = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Block at (299, 72, -54): ${missingBlock ? missingBlock.name : 'null'}`);

// 2. Check blocks around portal sill
for (let x = 298; x <= 301; x++) {
  const b = bot.blockAt(new Vec3(x, 72, -54));
  console.log(`Frame sill (${x}, 72, -54): ${b ? b.name : 'null'}`);
}

// 3. Check Base Chest (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const items = chest.items();
    console.log('Base Chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
    await chest.close();
  } catch (e) {
    console.log('Chest notice:', e.message);
  }
}

// 4. Check furnace at (295, 72, -55)
const fb = bot.blockAt(new Vec3(295, 72, -55));
if (fb) {
  try {
    const f = await bot.openFurnace(fb);
    console.log(`Furnace: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
    await f.close();
  } catch (e) {}
}

// Check nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== bot.username) {
    const dist = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (${dist}m), holding: ${p.entity.heldItem?.name}`);
  }
}

return {
  missing_block: missingBlock ? missingBlock.name : 'null',
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay
};
