// programs/307-check-expedition-status.js
console.log('=== EXPEDITION STATUS CHECK ===');
console.log('Gamma pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Check all players
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    const held = p.entity.heldItem?.name || 'none';
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m) holding: ${held}`);
  } else {
    console.log(`Player ${name}: no entity nearby`);
  }
}

// Check base chest
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest at (293, 72, -57):', JSON.stringify(contents));
} catch (e) {
  console.log('Chest note:', e.message);
}

// Check furnaces
const furnaces = [new Vec3(295, 72, -54), new Vec3(295, 72, -55), new Vec3(295, 72, -56), new Vec3(295, 72, -57)];
for (const p of furnaces) {
  const b = bot.blockAt(p);
  if (b && b.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(b);
      const out = f.outputItem();
      const fuel = f.fuelItem();
      const inp = f.inputItem();
      console.log(`Furnace at ${lib.fmt(p)}: in=${inp?.name}x${inp?.count}, fuel=${fuel?.name}x${fuel?.count}, out=${out?.name}x${out?.count}`);
      if (out) await f.takeOutput();
      await f.close();
    } catch (e) {}
  }
}

console.log('Inv:', JSON.stringify(lib.inv()));
const t = lib.time();
console.log(`Time: ${t.timeOfDay} (${t.phase}), night in ${t.secondsUntilNight}s`);
