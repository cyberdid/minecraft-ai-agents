// programs/167-dig-out-to-surface.js
console.log('Pos:', lib.fmt(bot.entity.position));

// Dig staircase up towards north/west (towards base at 294, 72, -54)
// Base is at -X, -Z
console.log('Digging staircase towards base (-X, -Z)...');

// To get out, dig blocks in front of us and above, then step up
for (let step = 0; step < 5; step++) {
  const p = bot.entity.position.floored();
  console.log(`Step ${step} at ${lib.fmt(p)}...`);
  
  // Dig north wall (z - 1)
  const front0 = p.offset(-1, 0, 0);
  const front1 = p.offset(-1, 1, 0);
  const front2 = p.offset(-1, 2, 0);
  
  for (const blkPos of [front2, front1, front0]) {
    const b = bot.blockAt(blkPos);
    if (b && b.name !== 'air' && b.boundingBox === 'block') {
      console.log(`Digging ${b.name} at ${lib.fmt(blkPos)}...`);
      try {
        await lib.dig(blkPos.x, blkPos.y, blkPos.z);
      } catch (e) {
        console.log('Dig error:', e.message);
      }
    }
  }
  
  // Step forward
  try {
    await lib.walkTo(front0.x + 0.5, front0.z + 0.5, 1000);
  } catch (e) {}
}

console.log('Pos after dig:', lib.fmt(bot.entity.position));

// Now try pathfinder to base
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  console.log('Reached base entrance!');
} catch (e) {
  console.log('goTo note:', e.message);
}
