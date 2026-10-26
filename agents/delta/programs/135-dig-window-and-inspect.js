// programs/135-dig-window-and-inspect.js
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

const windowPos = new Vec3(44, 66, -130);
const block = bot.blockAt(windowPos);
console.log('Block at window target:', block?.name);

if (block && block.name === 'dirt') {
  console.log('Digging eye-level dirt window at (44, 66, -130)...');
  await lib.dig(44, 66, -130);
  console.log('Window dug successfully! Block now:', bot.blockAt(windowPos)?.name);
}

// Inspect view through window
console.log('Blocks visible through window (z=-131..-133):');
for (let z = -131; z >= -133; z--) {
  for (let x = 44; x <= 46; x++) {
    for (let y = 64; y <= 67; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        console.log(`Solid block at (${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}

console.log('Waist barricade at (44, 65, -130):', bot.blockAt(new Vec3(44, 65, -130))?.name);
bot.chat('delta: Created secure 1-block engineering window at (44, 66, -130) to build enclosed North corridor to Blaze Spawner.');
