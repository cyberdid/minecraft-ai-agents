// programs/322-inspect-and-free-beta.js
console.log('=== Free beta at y=39 ===');
const pos = bot.entity.position;
console.log('Exact pos:', pos);
console.log('onGround:', bot.entity.onGround, 'velocity:', bot.entity.velocity);

const bx = Math.floor(pos.x);
const by = Math.floor(pos.y);
const bz = Math.floor(pos.z);

for (let y = by - 1; y <= by + 2; y++) {
  for (let z = bz - 1; z <= bz + 1; z++) {
    for (let x = bx - 1; x <= bx + 1; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      console.log(`Block at (${x}, ${y}, ${z}): ${b ? b.name : 'null'} (bb: ${b?.boundingBox})`);
    }
  }
}

// Equip pickaxe and clear blocks colliding with bounding box
await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand');

// Check block at feet
const footBlock = bot.blockAt(new Vec3(bx, by, bz));
if (footBlock && footBlock.name !== 'air' && footBlock.name !== 'cave_air') {
  console.log(`Digging foot block at (${bx}, ${by}, ${bz}) (${footBlock.name})...`);
  await bot.dig(footBlock);
}

// Check block at head
const headBlock = bot.blockAt(new Vec3(bx, by + 1, bz));
if (headBlock && headBlock.name !== 'air' && headBlock.name !== 'cave_air') {
  console.log(`Digging head block at (${bx}, ${by + 1}, ${bz}) (${headBlock.name})...`);
  await bot.dig(headBlock);
}

// Check adjacent blocks at same level that could pinch
for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  const side = bot.blockAt(new Vec3(bx + dx, by, bz + dz));
  if (side && side.boundingBox === 'block') {
    // If player is overlapping into this side block:
    const distToCenter = Math.abs((bx + dx + 0.5) - pos.x) + Math.abs((bz + dz + 0.5) - pos.z);
    if (distToCenter < 1.0) {
      console.log(`Digging pinching side block at (${bx + dx}, ${by}, ${bz + dz}) (${side.name})...`);
      await bot.dig(side);
    }
  }
}

console.log('Freed pos:', lib.fmt(bot.entity.position), 'onGround:', bot.entity.onGround);
