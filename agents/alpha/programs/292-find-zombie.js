// programs/292-find-zombie.js
console.log('=== Program 292: Find Zombie ===');
const p = bot.entity.position;
const hostiles = Object.values(bot.entities).filter(e => e.type === 'hostile' && p.distanceTo(e.position) < 16);

for (const h of hostiles) {
  console.log(`Hostile: ${h.name} at ${lib.fmt(h.position)}, dist=${p.distanceTo(h.position).toFixed(1)}m`);
}
