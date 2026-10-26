// programs/270-get-flint-and-craft-lighter.js
console.log('=== Step 28: Extract flint from gravel and craft flint & steel ===');

const placeSpot = new Vec3(293, 72, -55);

// Loop placing and digging gravel until flint drops
let attempts = 0;
while (lib.count('flint') === 0 && (lib.count('gravel') > 0 || bot.blockAt(placeSpot)?.name === 'gravel') && attempts < 30 && !isCancelled()) {
  attempts++;
  const currentBlock = bot.blockAt(placeSpot);
  if (!currentBlock || currentBlock.name === 'air') {
    if (lib.count('gravel') > 0) {
      await lib.place('gravel', placeSpot.x, placeSpot.y, placeSpot.z);
    }
  }
  const blk = bot.blockAt(placeSpot);
  if (blk && blk.name === 'gravel') {
    await lib.dig(placeSpot.x, placeSpot.y, placeSpot.z);
    await lib.pickup(4);
  }
  await sleep(150);
}

console.log(`Flint extraction done in ${attempts} attempts. Flint count: ${lib.count('flint')}`);

// Craft flint and steel
if (lib.count('flint_and_steel') === 0 && lib.count('flint') > 0 && lib.count('iron_ingot') > 0) {
  console.log('Crafting flint_and_steel...');
  try {
    await lib.craft('flint_and_steel', 1);
    console.log('Crafted flint_and_steel successfully!');
    bot.chat('alpha: Congratulations on Diamonds! I crafted flint_and_steel. Water bucket and igniter ready for Nether portal!');
  } catch (e) {
    console.log('Craft error:', e.message);
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Beta tools now:', JSON.stringify(lib.tools()));
