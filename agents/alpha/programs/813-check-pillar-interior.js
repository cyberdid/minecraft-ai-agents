// programs/813-check-pillar-interior.js
for (let y = 24; y <= 65; y += 5) {
  const b = bot.blockAt(new Vec3(44, y, -125));
  console.log(`y=${y}: ${b ? b.name : 'null'}`);
}
