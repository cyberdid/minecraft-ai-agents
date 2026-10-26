// programs/549-inspect-tunnel-blocks.js
console.log('=== Program 549: Inspect Tunnel from z=-6 to z=-22 ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

for (let z = -6; z >= -22; z--) {
  const floor = bot.blockAt(new Vec3(63, 64, z))?.name || 'air';
  const lower = bot.blockAt(new Vec3(63, 65, z))?.name || 'air';
  const upper = bot.blockAt(new Vec3(63, 66, z))?.name || 'air';
  const roof = bot.blockAt(new Vec3(63, 67, z))?.name || 'air';
  console.log(`z=${z}: floor(y=64)=${floor}, feet(y=65)=${lower}, head(y=66)=${upper}, roof(y=67)=${roof}`);
}
