// programs/434-pillbox-combat-and-drops.js
globalThis.isCancelled = isCancelled;

console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Inspect dropped items nearby
const droppedItems = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 12);
console.log(`Found ${droppedItems.length} dropped items nearby:`);
for (const item of droppedItems) {
  const meta = item.metadata;
  console.log(`  Item entity #${item.id} at ${lib.fmt(item.position)} dist: ${bot.entity.position.distanceTo(item.position).toFixed(1)}m`);
}

// 2. Check blocks in front of slit
console.log('Blocks ahead from x=37 down to x=33 along z=-186:');
for (let x = 37; x >= 33; x--) {
  const floor = bot.blockAt(new Vec3(x, 65, -186));
  const slit1 = bot.blockAt(new Vec3(x, 66, -186));
  const slit2 = bot.blockAt(new Vec3(x, 67, -186));
  console.log(`  x=${x}: floor(y=65)=${floor?.name}, y=66=${slit1?.name}, y=67=${slit2?.name}`);
}

// 3. Check Blazes
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze' && e.isValid);
console.log(`Found ${blazes.length} Blazes nearby:`);
for (const b of blazes) {
  console.log(`  Blaze #${b.id} at ${lib.fmt(b.position)} dist: ${bot.entity.position.distanceTo(b.position).toFixed(1)}m`);
}
