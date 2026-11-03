// programs/717-inspect-terrain-to-perch.js
console.log('Inspecting terrain from x=26 to x=3 along z=0:');
for (let x = 26; x >= 3; x--) {
  const b56 = bot.blockAt(new Vec3(x, 56, 0))?.name;
  const b57 = bot.blockAt(new Vec3(x, 57, 0))?.name;
  const b58 = bot.blockAt(new Vec3(x, 58, 0))?.name;
  const b59 = bot.blockAt(new Vec3(x, 59, 0))?.name;
  const b60 = bot.blockAt(new Vec3(x, 60, 0))?.name;
  console.log(`x=${x}: y56=${b56}, y57=${b57}, y58=${b58}, y59=${b59}, y60=${b60}`);
}
