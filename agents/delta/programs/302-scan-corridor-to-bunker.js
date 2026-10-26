// programs/302-scan-corridor-to-bunker.js
console.log('Scanning corridor from z=-40 to z=-100:');
for (let z = -40; z >= -100; z -= 5) {
  let line = `z=${z}: `;
  for (let x = 60; x <= 64; x++) {
    for (let y = 64; y <= 67; y++) {
      const bFloor = bot.blockAt(new Vec3(x, y - 1, z));
      const bAt = bot.blockAt(new Vec3(x, y, z));
      const bHead = bot.blockAt(new Vec3(x, y + 1, z));
      const isWalkable = bFloor && bFloor.boundingBox === 'block' && (!bAt || bAt.boundingBox === 'empty') && (!bHead || bHead.boundingBox === 'empty');
      if (isWalkable) {
        line += `[(${x},${y},${z})] `;
      }
    }
  }
  console.log(line);
}
