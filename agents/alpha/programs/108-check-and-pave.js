// programs/108-check-and-pave.js
const p55 = new Vec3(294, 71, -55);
const p56 = new Vec3(294, 71, -56);
console.log('Block at (294, 71, -55):', bot.blockAt(p55)?.name);
console.log('Block at (294, 71, -56):', bot.blockAt(p56)?.name);

// If p55 is air, place cobblestone
if (bot.blockAt(p55)?.name === 'air') {
  console.log('Placing cobblestone at (294, 71, -55)...');
  await lib.place('cobblestone', 294, 71, -55);
  console.log('Paved! Block is now:', bot.blockAt(p55)?.name);
}

// Now place white_bed at (294, 72, -56)
console.log('Placing bed...');
await lib.place('white_bed', 294, 72, -56);
console.log('Bed block at (294, 72, -56):', bot.blockAt(new Vec3(294, 72, -56))?.name);

await lib.setSpawn();
bot.chat('alpha: Bed 1 securely placed and spawn set.');
