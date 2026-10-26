// programs/136-check-environment.js
console.log('Status:', JSON.stringify(lib.status()));
const animals = [];
const hostiles = [];
for (const e of Object.values(bot.entities)) {
  if (!e || !e.position) continue;
  const dist = bot.entity.position.distanceTo(e.position);
  if (['cow', 'pig', 'sheep', 'chicken'].includes(e.name)) {
    animals.push({ name: e.name, pos: lib.fmt(e.position), dist: dist.toFixed(1) });
  } else if (e.type === 'mob' && e.name !== 'cow' && e.name !== 'pig' && e.name !== 'sheep' && e.name !== 'chicken') {
    hostiles.push({ name: e.name, pos: lib.fmt(e.position), dist: dist.toFixed(1) });
  } else if (e.type === 'player' && e.username !== bot.username) {
    console.log(`Player ${e.username} at ${lib.fmt(e.position)}, dist: ${dist.toFixed(1)}`);
  }
}
console.log('Nearby animals:', JSON.stringify(animals));
console.log('Nearby other mobs:', JSON.stringify(hostiles));

// Also check inventory
console.log('Inventory:', JSON.stringify(lib.inv()));
