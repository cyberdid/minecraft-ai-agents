// programs/714-check-food-and-farm.js
console.log('=== Checking Food Sources in Overworld ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Check wheat crops
const wheat = bot.findBlocks({ matching: b => b && b.name === 'wheat' && b.metadata === 7, maxDistance: 32, count: 10 });
console.log(`Found ${wheat.length} mature wheat crops nearby.`);

// Check animals
const animals = Object.values(bot.entities).filter(e =>
  ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) <= 32
);
console.log(`Found ${animals.length} animals within 32m:`);
for (const a of animals.slice(0, 5)) {
  console.log(` - ${a.name} at ${lib.fmt(a.position)} (dist ${bot.entity.position.distanceTo(a.position).toFixed(1)}m)`);
}

// Check furnace contents at base
const furnaceCoords = [new Vec3(295, 72, -54), new Vec3(295, 72, -55), new Vec3(295, 72, -56)];
for (const fc of furnaceCoords) {
  const b = bot.blockAt(fc);
  if (b && (b.name === 'furnace' || b.name === 'lit_furnace')) {
    try {
      const f = await bot.openFurnace(b);
      console.log(`Furnace at ${lib.fmt(fc)}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      if (f.outputItem()) {
        await f.takeOutput();
        console.log(`Took ${f.outputItem()?.name} from furnace!`);
      }
      f.close();
    } catch (e) {}
  }
}

console.log('Alpha inv:', lib.inv());
