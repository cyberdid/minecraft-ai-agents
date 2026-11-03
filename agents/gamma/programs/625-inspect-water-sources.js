// programs/625-inspect-water-sources.js
console.log('=== WATER SOURCES INSPECTION ===');
for (const pos of [
  new Vec3(299, 72, -54),
  new Vec3(299, 73, -54),
  new Vec3(300, 72, -54),
  new Vec3(300, 73, -54),
  new Vec3(298, 73, -54),
  new Vec3(299, 73, -53),
  new Vec3(300, 73, -53)
]) {
  const b = bot.blockAt(pos);
  if (b && b.name === 'water') {
    console.log(`Water at ${lib.fmt(pos)}: metadata = ${b.metadata} (isSource: ${b.metadata === 0})`);
  }
}
