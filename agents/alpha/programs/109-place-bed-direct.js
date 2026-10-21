// programs/109-place-bed-direct.js
// Place bed directly on floor block at (294, 71, -56)

console.log('Placing bed directly on floor...');
const floor = bot.blockAt(new Vec3(294, 71, -56));
console.log('Floor block:', floor.name);

await bot.equip(mcData.itemsByName.white_bed.id, 'hand');
await bot.lookAt(new Vec3(294.5, 71.9, -56.5), true);
await sleep(150);

try {
  await bot.placeBlock(floor, new Vec3(0, 1, 0));
  console.log('Bed placed successfully!');
} catch (e) {
  console.log('placeBlock note:', e.message);
}

const bedAt = bot.blockAt(new Vec3(294, 72, -56));
console.log('Block at (294, 72, -56):', bedAt ? bedAt.name : 'null');

if (bedAt && bedAt.name.includes('bed')) {
  await lib.setSpawn();
  bot.chat('alpha: Bed placed and spawn set!');
}
