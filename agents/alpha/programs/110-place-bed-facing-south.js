// programs/110-place-bed-facing-south.js
// Stand north of the bed at (294.5, 72, -57.2), look south, and place bed so it extends to (294, 72, -55)

console.log('Positioning north of bed spot...');
await lib.walkTo(294.5, -57.2);
console.log('Alpha at:', lib.fmt(bot.entity.position));

const floor = bot.blockAt(new Vec3(294, 71, -56));
console.log('Floor block:', floor.name);

// Look south (increasing z) at top face of floor
await bot.lookAt(new Vec3(294.5, 71.9, -56.5), true);
await sleep(200);

await bot.equip(mcData.itemsByName.white_bed.id, 'hand');
await sleep(100);

try {
  await bot.placeBlock(floor, new Vec3(0, 1, 0));
  console.log('Placed bed!');
} catch (e) {
  console.log('placeBlock note:', e.message);
}

const b56 = bot.blockAt(new Vec3(294, 72, -56));
const b55 = bot.blockAt(new Vec3(294, 72, -55));
console.log('Block at (294, 72, -56):', b56 ? b56.name : 'null');
console.log('Block at (294, 72, -55):', b55 ? b55.name : 'null');

if (b56 && b56.name.includes('bed')) {
  await lib.setSpawn();
  bot.chat('alpha: Bed 1 securely placed and spawn set!');
}
