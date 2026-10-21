// programs/073-check-pit.js
for (let y = 71; y >= 65; y--) {
  console.log(`y=${y}:`, bot.blockAt(new Vec3(294, y, -53))?.name);
}
