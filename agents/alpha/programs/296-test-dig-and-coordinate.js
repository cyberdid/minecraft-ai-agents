// programs/296-test-dig-and-coordinate.js
console.log('=== Program 296: Coordinate Beta & Check Zombie ===');

// Chat to Beta and team
bot.chat('beta: Beta, can you pathfind up towards base (294, 72, -55)? Gamma and Delta have food and beds ready!');
bot.chat('delta: Delta, Beta is at (297, 39, 2) with 10 obsidian and flint/steel. Can you help escort Beta up?');

// Check the zombie position
const z = Object.values(bot.entities).find(e => e.name === 'zombie' && bot.entity.position.distanceTo(e.position) < 16);
if (z) {
  console.log(`Zombie at ${lib.fmt(z.position)}, dist=${bot.entity.position.distanceTo(z.position).toFixed(1)}m`);
}

// Dig stone at (336, 22, -68)
const stoneBlock = bot.blockAt(new Vec3(336, 22, -68));
console.log('Block at (336, 22, -68):', stoneBlock?.name);
if (stoneBlock && stoneBlock.name === 'stone') {
  console.log('Digging stone block at (336, 22, -68)...');
  await bot.dig(stoneBlock);
  console.log('Stone dug!');
}

console.log('Pos now:', lib.fmt(bot.entity.position), 'Health:', bot.health);
