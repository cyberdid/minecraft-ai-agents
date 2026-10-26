// programs/269-check-zombie-and-base-portal.js
console.log('=== Program 269: Check Zombie & Base Portal ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'hp:', bot.health);

// Check hostiles
const mobs = Object.values(bot.entities).filter(e => e.type === 'mob');
for (const m of mobs) {
  const d = bot.entity.position.distanceTo(m.position);
  if (d < 25) {
    console.log(`Mob ${m.name} at ${lib.fmt(m.position)}, dist=${d.toFixed(1)}m`);
  }
}

// Check Beta, Delta, Gamma
for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name]?.entity;
  if (p) {
    console.log(`Player ${name} at ${lib.fmt(p.position)}, held=${p.heldItem?.name}`);
  }
}

// Check portal frame missing at base
const frame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(frame);
console.log('Portal missing at (298, 72, -54):', JSON.stringify(mat.missing));
