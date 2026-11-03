// programs/588-return-to-base-portal.js
console.log('=== RETURN TO BASE PORTAL ===');
console.log('Current Pos:', lib.fmt(bot.entity.position));

bot.chat('gamma: Returning to base portal at (293, 72, -55) to join Beta and Delta!');

try {
  await lib.goTo(293, 72, -55, 2.0, { timeoutMs: 35000 });
} catch (e) {
  try {
    await lib.goToXZ(293, -55, { timeoutMs: 25000 });
  } catch (e2) {}
}

console.log('Arrived at base! Pos:', lib.fmt(bot.entity.position));

// Check portal status
const sill = bot.blockAt(new Vec3(299, 72, -54));
const p1 = bot.blockAt(new Vec3(299, 73, -54));
console.log('Sill (299, 72, -54):', sill ? sill.name : 'null');
console.log('Portal block (299, 73, -54):', p1 ? p1.name : 'null');

for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}

bot.chat(`gamma: At base portal (${lib.fmt(bot.entity.position)})! Ready to warp into Nether!`);

return {
  pos: bot.entity.position,
  sill: sill?.name,
  portal: p1?.name,
  hp: bot.health,
  food: bot.food
};
