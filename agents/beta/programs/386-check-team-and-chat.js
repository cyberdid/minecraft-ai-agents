// programs/386-check-team-and-chat.js
console.log('=== Step: Check offhand and team status ===');
const offhand = bot.inventory.slots[45];
console.log('Offhand item:', offhand?.name);

for (const [name, player] of Object.entries(bot.players)) {
  if (player.entity) {
    const pos = player.entity.position;
    const dist = bot.entity.position.distanceTo(pos).toFixed(1);
    console.log(`Player ${name}: pos=${lib.fmt(pos)}, dist=${dist}m, held=${player.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name}: (no entity in range)`);
  }
}
