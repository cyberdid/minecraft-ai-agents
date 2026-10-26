// programs/205-inspect-base-storage.js
console.log('--- INSPECT BASE CHEST AND FURNACES ---');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Inspect chest at (293, 72, -57)
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(contents));
} catch (e) {
  console.log('Chest error:', e.message);
}

// 2. Inspect furnaces
for (const pos of [new Vec3(295, 72, -55), new Vec3(295, 72, -57)]) {
  const b = bot.blockAt(pos);
  if (b && b.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(b);
      console.log(`Furnace at ${lib.fmt(pos)}:`,
        'input=', f.inputItem()?.name, f.inputItem()?.count,
        'fuel=', f.fuelItem()?.name, f.fuelItem()?.count,
        'output=', f.outputItem()?.name, f.outputItem()?.count);
      if (f.outputItem()) {
        console.log(`Taking output ${f.outputItem().name} x ${f.outputItem().count}...`);
        await f.takeOutput();
      }
      f.close();
    } catch (e) {
      console.log(`Furnace error at ${lib.fmt(pos)}:`, e.message);
    }
  }
}

// Check nearby players
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username) {
    console.log(`Player ${p.username}: ${p.entity ? lib.fmt(p.entity.position) : 'offline/far'}`);
  }
}

console.log('Gamma inventory now:', JSON.stringify(lib.inv()));
