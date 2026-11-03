// programs/841-inspect-portal-frame-exact.js
console.log('=== Program 841: Inspect Full Portal Frame & Corners ===');
globalThis.isProgramCancelled = isCancelled;

const p = bot.entity.position;
console.log(`Current pos: ${lib.fmt(p)}`);

// Move to base exterior / portal area (297, 72, -54)
try {
  await lib.goTo(297, 72, -54, 2.0, { timeoutMs: 8000 });
} catch (e) {}

console.log('Scanning all portal blocks in range x=[298..301], y=[71..76], z=[-55..-53]:');

for (let y = 76; y >= 71; y--) {
  let line = `y=${y}: `;
  for (let x = 298; x <= 301; x++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    line += `(${x},${y})=${b ? b.name : 'null'}  `;
  }
  console.log(line);
}

// Check if anyone in team has obsidian in inventory
for (const [name, player] of Object.entries(bot.players)) {
  if (player && player.entity) {
    const e = player.entity;
    console.log(`Player ${name} held: ${e.heldItem ? e.heldItem.name : 'empty'}, pos: ${lib.fmt(e.position)}`);
  }
}
