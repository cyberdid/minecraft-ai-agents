// programs/369-inspect-base-for-shield.js
console.log('=== INSPECT BASE FOR IRON & SHIELD ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Step into base
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 8000 });
} catch (e) {}
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// Pickup drops inside base
try { await lib.pickup(6); } catch (e) {}

// Check chest
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(contents));
  // If iron_ingot or raw_iron or shield or planks
  for (const it of ['iron_ingot', 'raw_iron', 'shield', 'birch_planks', 'oak_planks']) {
    if (contents && contents[it] > 0) {
      await lib.withdraw({ [it]: 'all' }, 293, 72, -57);
      console.log(`Withdrew ${it} x${contents[it]}`);
    }
  }
} catch (e) {
  console.log('Chest error:', e.message);
}

// Check all 3 furnaces
for (const fz of [-54, -55, -56]) {
  const fPos = new Vec3(295, 72, fz);
  const fb = bot.blockAt(fPos);
  if (fb && fb.name.includes('furnace')) {
    try {
      const furnace = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fPos)}: input=${furnace.inputItem()?.name}x${furnace.inputItem()?.count}, fuel=${furnace.fuelItem()?.name}x${furnace.fuelItem()?.count}, output=${furnace.outputItem()?.name}x${furnace.outputItem()?.count}`);
      if (furnace.outputItem()) {
        await furnace.takeOutput();
        console.log(`Took output ${furnace.outputItem()?.name}`);
      }
      furnace.close();
    } catch (e) {
      console.log('Furnace error at', lib.fmt(fPos), e.message);
    }
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
