// programs/461-harvest-furnaces-and-check-gear.js
console.log('=== Step: Harvest Furnaces at Base ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Walk right up to (294.5, 72.0, -55.5) in front of the 3 furnaces
await lib.goTo(294.5, 72.0, -55.5, 0.5);
console.log('At furnace station:', lib.fmt(bot.entity.position));

const furnacePositions = [
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -56)
];

for (const fp of furnacePositions) {
  const fb = bot.blockAt(fp);
  if (fb && fb.name.includes('furnace')) {
    try {
      await bot.lookAt(fp.offset(0.5, 0.5, 0.5));
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fp)}:`);
      console.log(`  input: ${f.inputItem()?.name} x${f.inputItem()?.count}`);
      console.log(`  fuel:  ${f.fuelItem()?.name} x${f.fuelItem()?.count}`);
      console.log(`  output: ${f.outputItem()?.name} x${f.outputItem()?.count}`);
      
      if (f.outputItem()) {
        await f.takeOutput();
        console.log(`  Took output: ${f.outputItem()?.name}`);
      }
      f.close();
    } catch (e) {
      console.log(`Furnace at ${lib.fmt(fp)} error:`, e.message);
    }
  }
}

// 2. Check Overworld players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} dist=${d.toFixed(1)}m`);
  }
}

// 3. Take crafting_table from chest if not placed
console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: At base re-arming station. Inv: ${JSON.stringify(lib.inv())}. Preparing full iron gear for Blaze raid!`);
