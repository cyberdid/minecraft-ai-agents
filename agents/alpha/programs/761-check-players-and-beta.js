// programs/761-check-players-and-beta.js
console.log('=== Program 761: Check Teammates Status & Base ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'food:', bot.food, 'HP:', bot.health);

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name}: entity not loaded (offline or far away)`);
  }
}

// Check Base Chest
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openContainer(cb);
    console.log('Base Chest items:');
    for (const it of chest.containerItems()) {
      if (it.name.includes('lava') || it.name.includes('iron') || it.name.includes('bucket') || it.name.includes('beef') || it.name.includes('food') || it.name.includes('pork') || it.name.includes('bread') || it.name.includes('potato') || it.name.includes('obsidian')) {
        console.log(` - ${it.name} x${it.count}`);
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest read error:', e.message);
  }
}

// Check Furnaces
for (const z of [-54, -55, -56]) {
  const fb = bot.blockAt(new Vec3(295, 72, z));
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at z=${z}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      f.close();
    } catch (e) {}
  }
}

return {};
