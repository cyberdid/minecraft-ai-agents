// programs/302-check-day-positions.js
console.log('=== Program 302: Check Day Positions & Portal ===');

for (const [name, p] of Object.entries(bot.players)) {
  if (name === 'alpha') continue;
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  }
}

// Portal frame status at (298, 72, -54)
const frame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(frame);
console.log('Portal missing at (298, 72, -54):', JSON.stringify(mat.missing));

bot.chat('team: Good morning! Beta, what is your current position? Delta/Gamma, is Beta at the portal site?');
