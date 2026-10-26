// programs/301-scan-corridor-ahead.js
console.log('Scanning corridor ahead from z=-20 to z=-40:');
for (let z = -20; z >= -40; z -= 2) {
  let line = `z=${z}: `;
  for (let x = 61; x <= 64; x++) {
    const bFloor = bot.blockAt(new Vec3(x, 64, z));
    const bAt = bot.blockAt(new Vec3(x, 65, z));
    const bHead = bot.blockAt(new Vec3(x, 66, z));
    const isWalkable = bFloor && bFloor.boundingBox === 'block' && (!bAt || bAt.boundingBox === 'empty') && (!bHead || bHead.boundingBox === 'empty');
    if (isWalkable) {
      line += `[x=${x} WALKABLE] `;
    }
  }
  console.log(line);
}
