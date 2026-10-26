// programs/286-path-to-skeleton.js
console.log('=== Program 286: Blocks towards Skeleton ===');
const alphaPos = bot.entity.position.floored();
const skelPos = new Vec3(341, 18, -67);

console.log('Alpha at:', lib.fmt(alphaPos), 'Skeleton at:', lib.fmt(skelPos));

// Check blocks along line from Alpha to Skeleton
for (let t = 0; t <= 5; t++) {
  const x = Math.round(alphaPos.x + (skelPos.x - alphaPos.x) * (t / 5));
  const y = Math.round(alphaPos.y + (skelPos.y - alphaPos.y) * (t / 5));
  const z = Math.round(alphaPos.z + (skelPos.z - alphaPos.z) * (t / 5));
  const b = bot.blockAt(new Vec3(x, y, z));
  console.log(`t=${t} (${x}, ${y}, ${z}): ${b?.name}`);
}

// Check what Gamma and Beta are doing
for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name]?.entity;
  if (p) {
    console.log(`Player ${name} at ${lib.fmt(p.position)}, held=${p.heldItem?.name}`);
  }
}
