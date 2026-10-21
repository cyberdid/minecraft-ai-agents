const Vec3 = require('vec3');

console.log('Bot pos:', bot.entity.position);
const base = new Vec3(37, 84, -15);

console.log('Column at (37, y, -15):');
for (let y = 84; y >= 78; y--) {
  const b = bot.blockAt(new Vec3(37, y, -15));
  console.log(`Y=${y}: ${b?.name}`);
}

const hostiles = globalThis.getNearbyHostiles(16);
console.log(`Nearby hostiles (${hostiles.length}):`, hostiles.map(h => `${h.name} at ${h.position.floored()}`));

return { hostiles: hostiles.length };
