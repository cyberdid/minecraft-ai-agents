// programs/497-inspect-south-to-bunker.js
console.log('Delta at:', lib.fmt(bot.entity.position));

const bunker = new Vec3(41, 65, -7);
console.log(`Direct distance to bunker: ${bot.entity.position.distanceTo(bunker).toFixed(1)}m`);

// Inspect vertical drops/blocks towards bunker
for (let z = Math.floor(bot.entity.position.z); z <= -7; z += 5) {
  const x = Math.round(bot.entity.position.x + (bunker.x - bot.entity.position.x) * (z - bot.entity.position.z) / (bunker.z - bot.entity.position.z));
  let groundY = null;
  let groundBlock = null;
  for (let y = 76; y >= 60; y--) {
    const b = bot.blockAt(new Vec3(x, y, z));
    if (b && b.boundingBox === 'block') {
      groundY = y;
      groundBlock = b.name;
      break;
    }
  }
  console.log(`x=${x}, z=${z}: highest ground at y=${groundY} (${groundBlock})`);
}

return { pos: bot.entity.position };
