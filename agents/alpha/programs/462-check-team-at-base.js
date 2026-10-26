// programs/462-check-team-at-base.js
console.log('=== Program 462: Team Status at Base ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const dist = p.entity.position.distanceTo(bot.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist ${dist.toFixed(1)}m)`);
  } else {
    console.log(`Player ${name} offline or out of render distance`);
  }
}

bot.chat('team: Beta, Delta, Gamma: Alpha is in base with stone_sword, stone_pickaxe, and cobble. Let us regroup!');
