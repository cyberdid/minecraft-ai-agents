// programs/169-inspect-gamma-tunnel-extension.js
console.log('Pos:', lib.fmt(bot.entity.position));

console.log('--- Inspecting tunnel extension from z=-135 to -140 ---');
for (let z = -135; z >= -140; z--) {
  let blocksAtZ = [];
  for (let y = 64; y <= 68; y++) {
    for (let x = 43; x <= 45; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        blocksAtZ.push(`(${x},${y}):${b.name}`);
      }
    }
  }
  console.log(`z=${z}: ${blocksAtZ.join(', ') || 'ALL AIR'}`);
}

// Equip weapon
await lib.equipWeapon();
console.log('Delta inventory:', JSON.stringify(lib.inv()));
bot.chat('delta: Dawn reached! Inspecting bridge extension to z=-138. Ready to receive team for Blaze Spawner assault.');
