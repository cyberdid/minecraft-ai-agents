// programs/876-inspect-end-spawn-and-bridge.js
console.log('=== Program 876: Inspect End Spawn & Bridge to Island ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.chat('alpha: In The End at (116, 49, 2)! Mapping bridge route to Main Island (0, 65, 0)!');

// 1. Check surrounding blocks
console.log('Under feet:', bot.blockAt(bot.entity.position.offset(0, -0.5, 0))?.name);
console.log('At feet:', bot.blockAt(bot.entity.position)?.name);
console.log('Head level:', bot.blockAt(bot.entity.position.offset(0, 1.8, 0))?.name);

// 2. Scan in the direction of Main Island (-X)
console.log('Scanning blocks along -X axis towards (0, y, 0):');
for (let x = Math.floor(bot.entity.position.x); x >= Math.floor(bot.entity.position.x) - 20; x -= 2) {
  const b = bot.blockAt(new Vec3(x, 48, 0));
  const bAir = bot.blockAt(new Vec3(x, 49, 0));
  console.log(`x=${x}, z=0: floor=${b?.name || 'void'}, above=${bAir?.name || 'void'}`);
}

// 3. Scan for teammates in The End
const teammates = Object.values(bot.entities).filter(e => ['beta', 'gamma', 'delta'].includes(e.username));
console.log(`Teammates nearby: ${teammates.length}`);
for (const tm of teammates) {
  console.log(`  ${tm.username} at ${lib.fmt(tm.position)}`);
}

// 4. Scan Ender Dragon position and health
const dragon = Object.values(bot.entities).find(e => e.name === 'ender_dragon');
if (dragon) {
  console.log(`Dragon at ${lib.fmt(dragon.position)}, velocity: ${lib.fmt(dragon.velocity)}`);
}
