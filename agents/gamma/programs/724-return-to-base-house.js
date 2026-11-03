// programs/724-return-to-base-house.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 724: RETURN TO BASE HOUSE (293, 72, -55) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

bot.chat('team: gamma returning 60m to Base House (293, 72, -55) to unite with Beta & Delta!');

const waypoints = [
  new Vec3(255, 68, -80),
  new Vec3(275, 71, -65),
  new Vec3(294, 72, -53)
];

for (const wp of waypoints) {
  if (isCancelled()) break;
  console.log(`Walking to ${lib.fmt(wp)}...`);
  try {
    await lib.goToXZ(wp.x, wp.z, { timeoutMs: 8000 });
  } catch (e) {
    try { await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0)); } catch (e2) {}
  }
}

// Enter Base House through door at (294, 72, -54)
console.log('Entering Base House...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(293.5, 72.0, -56.0, 1.0)); } catch (e2) {}
}

console.log('Inside Base House! Pos:', lib.fmt(bot.entity.position));

// Check teammates in base
for (const [name, p] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  if (p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

// Eat food if hungry
for (const f of ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton']) {
  if (lib.count(f) > 0 && bot.food < 18) {
    try { await lib.eat(); } catch (e) {}
  }
}

// Equip best weapons and shield
try { await lib.equipArmor(); } catch (e) {}
const ns = bot.inventory.items().find(i => i.name === 'netherite_sword');
if (ns) await bot.equip(ns, 'hand');
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh) await bot.equip(sh, 'off-hand');

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
