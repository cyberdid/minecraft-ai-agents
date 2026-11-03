// programs/556-check-portal-sill.js
const b72 = bot.blockAt(new Vec3(299, 72, -54));
const b73 = bot.blockAt(new Vec3(299, 73, -54));
console.log('Block at (299, 72, -54):', b72 ? b72.name : 'null');
console.log('Block at (299, 73, -54):', b73 ? b73.name : 'null');

// Also check furnaces
for (const fPos of [new Vec3(295, 72, -55), new Vec3(295, 72, -54), new Vec3(295, 72, -56)]) {
  const fb = bot.blockAt(fPos);
  console.log(`Furnace at ${fPos}:`, fb ? fb.name : 'null');
}
