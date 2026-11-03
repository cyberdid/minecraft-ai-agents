// programs/806-inspect-ridge-tunnel.js
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

const p = bot.entity.position;

// Check blocks along x=62..64, y=64..66, z=-2..-20
for (let z = Math.floor(p.z); z >= Math.floor(p.z) - 10; z--) {
  const floor = bot.blockAt(new Vec3(Math.floor(p.x), 64, z));
  const feet = bot.blockAt(new Vec3(Math.floor(p.x), 65, z));
  const head = bot.blockAt(new Vec3(Math.floor(p.x), 66, z));
  const roof = bot.blockAt(new Vec3(Math.floor(p.x), 67, z));
  console.log(`z=${z}: floor=${floor ? floor.name : 'null'}, feet=${feet ? feet.name : 'null'}, head=${head ? head.name : 'null'}, roof=${roof ? roof.name : 'null'}`);
}
