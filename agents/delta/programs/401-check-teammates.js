// programs/401-check-teammates.js
for (const name of ['alpha', 'beta', 'gamma']) {
  const p = bot.players[name]?.entity;
  if (p) {
    console.log(`Teammate ${name} at ${lib.fmt(p.position)}, held: ${p.heldItem?.name || 'none'}`);
  } else {
    console.log(`Teammate ${name} not nearby`);
  }
}
