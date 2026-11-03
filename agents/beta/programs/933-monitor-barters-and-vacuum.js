console.log('=== Program 933: Monitor Barters & Vacuum Drops ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Beta start pearls:', lib.count('ender_pearl'));

// Pickup any drops around the Piglin cluster
await lib.pickup(6.0);

console.log('Inventory after pickup:', JSON.stringify(lib.inv()));
const pearls = lib.count('ender_pearl');
console.log(`Ender Pearls currently held by Beta: ${pearls}`);

for (const p of Object.values(bot.players)) {
  if (p.entity) {
    console.log(`Teammate ${p.username}: pos=${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}
