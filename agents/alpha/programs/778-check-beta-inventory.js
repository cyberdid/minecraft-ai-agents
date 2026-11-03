// programs/778-check-beta-inventory.js
console.log('=== Program 778: Check Beta After Respawn ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

const beta = bot.players['beta'];
if (beta && beta.entity) {
  console.log(`Beta at ${lib.fmt(beta.entity.position)}`);
  console.log(`Beta held: ${beta.entity.heldItem?.name}`);
  console.log(`Beta equipment:`, beta.entity.equipment?.map(e => e?.name));
} else {
  console.log('Beta not found nearby');
}

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} held: ${p.entity.heldItem?.name}`);
  }
}

return {};
