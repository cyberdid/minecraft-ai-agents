// programs/294-step-forward-and-inspect.js
console.log('=== Program 294: Step Forward to (336, 22, -69) ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// Walk forward 1 block (+Z)
bot.setControlState('forward', true);
await sleep(400);
bot.setControlState('forward', false);

console.log('Pos after step:', lib.fmt(bot.entity.position));

// Now inspect in all 4 cardinal directions from new position
const pos = bot.entity.position.floored();
const dirs = [
  { name: '+X (East)', dx: 1, dz: 0 },
  { name: '-X (West)', dx: -1, dz: 0 },
  { name: '+Z (South)', dx: 0, dz: 1 },
  { name: '-Z (North)', dx: 0, dz: -1 }
];

for (const d of dirs) {
  let line = `${d.name}: `;
  for (let dist = 1; dist <= 4; dist++) {
    const p = pos.offset(d.dx * dist, 0, d.dz * dist);
    const bFeet = bot.blockAt(p);
    const bHead = bot.blockAt(p.offset(0, 1, 0));
    const bFloor = bot.blockAt(p.offset(0, -1, 0));
    line += `[d=${dist}: f=${bFloor?.name}, feet=${bFeet?.name}, head=${bHead?.name}] `;
  }
  console.log(line);
}

// Check Beta
if (bot.players.beta?.entity) {
  console.log('Beta pos:', lib.fmt(bot.players.beta.entity.position), 'held:', bot.players.beta.entity.heldItem?.name);
}
