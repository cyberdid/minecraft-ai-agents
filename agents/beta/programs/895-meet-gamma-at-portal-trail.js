// programs/895-meet-gamma-at-portal-trail.js
console.log('=== Program 895: Meet Gamma at Portal Trail (54, 65, -7) ===');
globalThis.isProgramCancelled = isCancelled;

const p = bot.entity.position;
console.log(`Beta pos: ${lib.fmt(p)}`);

// Walk to (54, 65, -7)
try {
  await lib.goTo(54, 65, -7, 1.5, { timeoutMs: 6000, dig: false });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(54, 65, -7, 1.5)); } catch (e2) {}
}

console.log(`At meeting point: ${lib.fmt(bot.entity.position)}`);

// Check Gamma entity
const gamma = bot.players['gamma']?.entity;
if (gamma) {
  console.log(`Gamma at ${lib.fmt(gamma.position)}, held: ${gamma.heldItem ? gamma.heldItem.name : 'empty'}`);
  bot.chat(`Beta: United with Gamma at ${lib.fmt(bot.entity.position)}! Do you have cooked food or flint & steel?`);
}

// Check nearby mobs
const mobs = Object.values(bot.entities).filter(e =>
  e.isValid &&
  bot.entity.position.distanceTo(e.position) <= 32 &&
  ['enderman', 'piglin', 'zombified_piglin', 'skeleton'].includes(e.name)
);
console.log(`Nearby mobs (${mobs.length}):`, mobs.map(m => `${m.name} (${Math.round(bot.entity.position.distanceTo(m.position))}m)`));

return {
  pos: bot.entity.position,
  gammaVisible: !!gamma
};
