// programs/278-inspect-surrounding-blocks.js
console.log('=== Program 278: Inspect Surrounding Blocks ===');
const pos = bot.entity.position.floored();
console.log('Bot pos:', lib.fmt(pos));

// Check what is at (336, 22, -68) and beyond in +Z
for (let dz = -3; dz <= 6; dz++) {
  const pFeet = pos.offset(0, 0, dz);
  const pHead = pFeet.offset(0, 1, 0);
  const pFloor = pFeet.offset(0, -1, 0);
  const bFeet = bot.blockAt(pFeet);
  const bHead = bot.blockAt(pHead);
  const bFloor = bot.blockAt(pFloor);
  console.log(`dz=${dz} (${lib.fmt(pFeet)}): floor=${bFloor?.name}, feet=${bFeet?.name}, head=${bHead?.name}`);
}

// Check where Beta, Delta, Gamma are
for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name]?.entity;
  if (p) {
    console.log(`Player ${name} at ${lib.fmt(p.position)}, held=${p.heldItem?.name}`);
  }
}

// Portal frame check
const frame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(frame);
console.log('Portal missing at (298, 72, -54):', JSON.stringify(mat.missing));
