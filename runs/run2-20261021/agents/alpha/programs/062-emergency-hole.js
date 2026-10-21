console.log('Digging down into 3-deep safety hole...');
const pos = bot.entity.position;
const bx = Math.floor(pos.x);
const bz = Math.floor(pos.z);
let by = Math.floor(pos.y);

// Dig down 2 or 3 blocks
for (let i = 0; i < 3; i++) {
  const target = lib.blockAt(bx, by - 1, bz);
  console.log(`Digging block at (${bx}, ${by - 1}, ${bz}): ${target?.name}`);
  if (target && target.name !== 'air') {
    await lib.dig(bx, by - 1, bz);
    await sleep(200);
    by = Math.floor(bot.entity.position.y);
  }
}

// Now place a block overhead if we have one and are deep enough
console.log('Position after digging down:', bot.entity.position);
const above = lib.blockAt(bx, Math.floor(bot.entity.position.y) + 2, bz);
console.log('Block above head:', above?.name);
