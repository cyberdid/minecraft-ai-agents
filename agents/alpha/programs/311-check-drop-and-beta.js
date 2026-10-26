// programs/311-check-drop-and-beta.js
console.log('=== Program 311: Check Drop & Beta Progress ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health);

// Teammates status
for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name]?.entity;
  if (p) {
    console.log(`Player ${name} at ${lib.fmt(p.position)}, held=${p.heldItem?.name}`);
  }
}

// Inspect around Alpha
const pos = bot.entity.position.floored();
console.log('Block at feet (y=17):', bot.blockAt(pos)?.name);
console.log('Block below feet (y=16):', bot.blockAt(pos.offset(0, -1, 0))?.name);
console.log('Block at y=15:', bot.blockAt(pos.offset(0, -2, 0))?.name);

// Check all 4 horizontal neighbors at y=17 and y=16
for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  const pSide = pos.offset(dx, 0, dz);
  console.log(`Neighbor (${pSide.x}, ${pSide.z}): at y=17 is ${bot.blockAt(pSide)?.name}, at y=16 is ${bot.blockAt(pSide.offset(0, -1, 0))?.name}`);
}
