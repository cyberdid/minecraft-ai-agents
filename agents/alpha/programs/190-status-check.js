// programs/190-status-check.js
console.log('Status check running...');
const status = lib.status();
console.log('alpha status:', JSON.stringify(status));
console.log('players:', JSON.stringify(Object.keys(bot.players)));
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p && p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
}
const entities = Object.values(bot.entities)
  .filter(e => e && e.position && e.position.distanceTo(bot.entity.position) < 32)
  .map(e => ({ name: e.name, type: e.type, dist: e.position.distanceTo(bot.entity.position).toFixed(1), pos: lib.fmt(e.position) }));
console.log('nearby entities within 32:', JSON.stringify(entities));
