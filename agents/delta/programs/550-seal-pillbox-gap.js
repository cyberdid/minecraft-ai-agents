// programs/550-seal-pillbox-gap.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: SEAL PILLBOX GAP WITH COBBLESTONE ===');
console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Cobble: ${lib.count('cobblestone')}`);

// Equip cobblestone
await bot.equip(mcData.itemsByName.cobblestone.id, 'hand');

// Function to place cobblestone at target pos
const placeBlockAt = async (targetPos) => {
  const current = bot.blockAt(targetPos);
  if (current && current.boundingBox === 'block') {
    console.log(`Block at ${lib.fmt(targetPos)} is already solid (${current.name}).`);
    return true;
  }

  // Find an adjacent solid block to place against
  for (const [dx, dy, dz] of [[0, -1, 0], [0, 1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]]) {
    const adjPos = targetPos.offset(dx, dy, dz);
    const adjBlock = bot.blockAt(adjPos);
    if (adjBlock && adjBlock.boundingBox === 'block') {
      try {
        console.log(`Placing cobblestone at ${lib.fmt(targetPos)} against ${adjBlock.name} at ${lib.fmt(adjPos)}...`);
        const faceVec = new Vec3(-dx, -dy, -dz);
        await bot.lookAt(targetPos.offset(0.5, 0.5, 0.5), true);
        await bot.placeBlock(adjBlock, faceVec);
        console.log(`Successfully placed cobblestone at ${lib.fmt(targetPos)}!`);
        return true;
      } catch (err) {
        console.log(`Place error at ${lib.fmt(targetPos)}:`, err.message);
      }
    }
  }
  return false;
};

// 1. Place at (36, 66, -188) (lower guard block)
await placeBlockAt(new Vec3(36, 66, -188));

// 2. Place at (36, 68, -187) (roof over pillbox head)
await placeBlockAt(new Vec3(36, 68, -187));

// 3. Place at (36, 68, -188) (roof guard block)
await placeBlockAt(new Vec3(36, 68, -188));

// 4. Place roof at (37, 68, -187) (directly above Delta's head)
await placeBlockAt(new Vec3(37, 68, -187));

console.log('--- VERIFYING WALL AT x=36 ---');
for (let z = -186; z >= -188; z--) {
  for (let y = 66; y <= 68; y++) {
    const b = bot.blockAt(new Vec3(36, y, z));
    console.log(`  (36, ${y}, ${z}): ${b ? b.name : 'null'}`);
  }
}

// Re-equip iron sword
await lib.equipWeapon();

bot.chat('delta: Pillbox gap sealed! Lower guard and blast roof placed with cobblestone. Firing slit secure at (36, 67, -186..-188)!');

return {
  hp: bot.health,
  cobbleRemaining: lib.count('cobblestone')
};
