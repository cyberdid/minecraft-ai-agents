// programs/774-inspect-beta-holding.js
console.log('=== Program 774: Check Beta Position & Held Item ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

const beta = bot.players['beta'];
if (beta && beta.entity) {
  console.log(`Beta at ${lib.fmt(beta.entity.position)}, held: ${beta.entity.heldItem?.name}`);
  console.log(`Beta equip:`, beta.entity.equipment?.map(e => e?.name));
} else {
  console.log('Beta entity not found nearby');
}

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== bot.username) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} held: ${p.entity.heldItem?.name}`);
  }
}

return {};
