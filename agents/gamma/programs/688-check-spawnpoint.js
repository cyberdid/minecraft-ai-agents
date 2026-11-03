// programs/688-check-spawnpoint.js
console.log('bot.spawnPoint:', bot.spawnPoint);
console.log('Overworld Base Bed at: (294, 72, -55)');
if (bot.spawnPoint) {
  const bedDist = bot.spawnPoint.distanceTo(new Vec3(294, 72, -55));
  console.log('Distance from spawnPoint to base bed:', bedDist);
}
return { spawnPoint: bot.spawnPoint };
