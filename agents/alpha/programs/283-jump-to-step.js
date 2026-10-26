// programs/283-jump-to-step.js
console.log('=== Program 283: Jump onto Step at (336, 23, -69) ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// Face +Z and jump forward
await bot.lookAt(new Vec3(336.5, 24.5, -68.5));
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(350);
bot.setControlState('jump', false);
await sleep(400);
bot.setControlState('forward', false);

console.log('Pos after jump:', lib.fmt(bot.entity.position));

// What is around now?
const p = bot.entity.position.floored();
console.log('Block at feet:', bot.blockAt(p)?.name);
console.log('Block below feet:', bot.blockAt(p.offset(0, -1, 0))?.name);
console.log('Block at head:', bot.blockAt(p.offset(0, 1, 0))?.name);

// Check if we can step further in +Z
for (let dz = 1; dz <= 5; dz++) {
  const ahead = p.offset(0, 0, dz);
  console.log(`dz=+${dz} (${lib.fmt(ahead)}): feet=${bot.blockAt(ahead)?.name}, head=${bot.blockAt(ahead.offset(0, 1, 0))?.name}, floor=${bot.blockAt(ahead.offset(0, -1, 0))?.name}`);
}

// Teammates status
for (const name of ['beta', 'gamma', 'delta']) {
  const pl = bot.players[name]?.entity;
  if (pl) {
    console.log(`Player ${name} at ${lib.fmt(pl.position)}, held=${pl.heldItem?.name}`);
  }
}
