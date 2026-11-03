const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
console.log('Block at (294, 72, -54):', doorBlock ? doorBlock.name : 'null');
const doorUp = bot.blockAt(new Vec3(294, 73, -54));
console.log('Block at (294, 73, -54):', doorUp ? doorUp.name : 'null');
// Check surrounding blocks
for (const p of [new Vec3(294, 72, -53), new Vec3(294, 72, -55), new Vec3(293, 72, -54), new Vec3(295, 72, -54)]) {
  console.log(`Block at ${p.x},${p.y},${p.z}:`, bot.blockAt(p)?.name);
}
