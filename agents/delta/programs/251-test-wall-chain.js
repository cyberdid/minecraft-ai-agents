// programs/251-test-wall-chain.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Inspect x=43 blocks at z=-160, -161, -162
for (let z = -159; z >= -163; z--) {
  for (let y = 64; y <= 67; y++) {
    const b = bot.blockAt(new Vec3(43, y, z));
    console.log(`(43, ${y}, ${z}): ${b?.name}`);
  }
}

// Place first West wall block at (43, 65, -162) if air
const target = new Vec3(43, 65, -162);
const current = bot.blockAt(target);
console.log('Target (43, 65, -162) current:', current?.name);

if (!current || current.name === 'air' || current.name === 'cave_air') {
  try {
    await lib.place('cobblestone', 43, 65, -162);
    console.log('Successfully placed West wall at (43, 65, -162)!');
  } catch (e) {
    console.log('Place error at (43, 65, -162):', e.message);
  }
}

const target2 = new Vec3(43, 65, -163);
const current2 = bot.blockAt(target2);
if (!current2 || current2.name === 'air' || current2.name === 'cave_air') {
  try {
    await lib.place('cobblestone', 43, 65, -163);
    console.log('Successfully placed West wall at (43, 65, -163)!');
  } catch (e) {
    console.log('Place error at (43, 65, -163):', e.message);
  }
}
