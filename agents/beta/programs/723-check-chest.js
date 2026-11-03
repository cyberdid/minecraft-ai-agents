// programs/723-check-chest.js
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
console.log('Chest block:', chestBlock?.name);
if (chestBlock && chestBlock.name.includes('chest')) {
  const chest = await bot.openChest(chestBlock);
  const items = chest.containerItems().map(i => `${i.name}x${i.count}`);
  console.log('Base chest items:', items.join(', ') || 'empty');
  const chestRods = chest.containerItems().find(i => i.name === 'blaze_rod')?.count || 0;
  console.log('Blaze rods in chest:', chestRods);
  await chest.close();
} else {
  console.log('No chest at (293, 72, -57)');
}
return { rodsInHand: lib.count('blaze_rod') };
