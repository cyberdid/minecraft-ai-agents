globalThis.isProgramCancelled = isCancelled;

console.log("Offhand (slot 45):", bot.inventory.slots[45]?.name);
console.log("Armor:", [5,6,7,8].map(s => bot.inventory.slots[s]?.name));
console.log("Held:", bot.heldItem?.name);

const players = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
for (const p of players) {
  console.log(`Player ${p.username}: pos=${p.entity.position.floored()}`);
}

const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 10);
console.log(`Nearby dropped items (${items.length}):`, items.map(i => `${bot.entity.position.distanceTo(i.position).toFixed(1)}m at ${i.position.floored()}`));

return { pos: bot.entity.position, hp: bot.health, offhand: bot.inventory.slots[45]?.name };
