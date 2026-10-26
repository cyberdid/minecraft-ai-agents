// programs/502-check-gamma-arrival.js
console.log('=== Program 502: Check Teammates at Front ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

// Check what blocks are on the East wall right next to Alpha
for (const y of [64, 65, 66]) {
  const eb = bot.blockAt(new Vec3(45, y, -173));
  console.log(`East wall at (45, ${y}, -173): ${eb?.name}`);
}

bot.chat('team: Alpha safely at (44, 65, -173.5)! Floor ends at z=-174. Gamma bring cobble to bridge forward!');
