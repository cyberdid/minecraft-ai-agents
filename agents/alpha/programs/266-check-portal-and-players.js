// programs/266-check-portal-and-players.js
console.log('=== Program 266: Check Portal Frame & Teammates ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'hp:', bot.health);

for (const [name, p] of Object.entries(bot.players)) {
  if (name === 'alpha') continue;
  if (p.entity) {
    console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name}: not in render distance`);
  }
}

// Check portal frame at (298, 72, -54)
const frame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(frame);
console.log('Portal frame missing materials:', JSON.stringify(mat.missing));

// Chat with team
bot.chat('team: Alpha is at (335, 23, -70). Beta, are you at base portal (298, 72, -54)?');
await sleep(3000);
