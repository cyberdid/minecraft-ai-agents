// programs/271-check-spawn-and-teammates.js
console.log('=== Program 271: Check Bot Spawn & Teammates ===');
console.log('Bot spawn point:', bot.spawnPoint ? lib.fmt(bot.spawnPoint) : 'default');
console.log('Bot health:', bot.health, 'food:', bot.food);

// Check teammates
for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name]?.entity;
  if (p) {
    console.log(`Player ${name} at ${lib.fmt(p.position)}, held=${p.heldItem?.name}`);
  }
}

// Check portal frame
const frame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(frame);
console.log('Portal missing at (298, 72, -54):', JSON.stringify(mat.missing));

// Ask delta in chat
bot.chat('delta: Delta, is Bed 1 at (294, 72, -55) open in base?');
await sleep(2000);
