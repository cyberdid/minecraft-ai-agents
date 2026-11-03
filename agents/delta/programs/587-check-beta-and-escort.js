const beta = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'beta');
if (beta) {
  console.log(`Beta found at ${lib.fmt(beta.position)}, dist: ${beta.position.distanceTo(bot.entity.position).toFixed(1)}`);
} else {
  console.log('Beta not found in loaded entities');
}

const alpha = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'alpha');
if (alpha) {
  console.log(`Alpha found at ${lib.fmt(alpha.position)}, dist: ${alpha.position.distanceTo(bot.entity.position).toFixed(1)}`);
}

const gamma = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'gamma');
if (gamma) {
  console.log(`Gamma found at ${lib.fmt(gamma.position)}, dist: ${gamma.position.distanceTo(bot.entity.position).toFixed(1)}`);
}

// Check portal sill
const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Sill (299,72,-54): ${sill?.name}`);

