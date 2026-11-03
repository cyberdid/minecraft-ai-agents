// programs/722-status-check.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 722: STATUS & TEAM CHECK ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'Dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

// Scan players
console.log('\n--- Players in Range ---');
for (const p of Object.values(bot.entities).filter(e => e.type === 'player')) {
  console.log(`- ${p.username}: pos=${lib.fmt(p.position)}, dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}m, held=${p.heldItem ? p.heldItem.name : 'null'}`);
}

// Check Base Chest
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openContainer(cb);
    const items = chest.containerItems();
    console.log('\n--- Base Chest Contents ---');
    for (const it of items) {
      console.log(`  ${it.name} x${it.count}`);
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Furnaces check
for (const fPos of [new Vec3(295, 72, -55), new Vec3(295, 72, -54), new Vec3(295, 72, -56)]) {
  const fb = bot.blockAt(fPos);
  if (fb && fb.name.includes('furnace')) {
    try {
      const fn = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fPos)}: input=${fn.inputItem()?.name} x${fn.inputItem()?.count}, output=${fn.outputItem()?.name} x${fn.outputItem()?.count}, fuel=${fn.fuelItem()?.name} x${fn.fuelItem()?.count}`);
      fn.close();
    } catch (e) {}
  }
}

console.log('\nDelta Inventory:', JSON.stringify(lib.inv()));
return { pos: bot.entity.position, hp: bot.health, food: bot.food };
