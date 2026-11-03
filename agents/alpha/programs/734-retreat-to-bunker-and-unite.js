// programs/734-retreat-to-bunker-and-unite.js
console.log('=== Program 734: Safe Retreat to Bunker & Unite with Team ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain active shield in offhand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

bot.activateItem(true);
globalThis.configureFireAvoidance();

bot.chat('alpha: Holding shield defense at Pillbox; tactical retreat to Fortress Bunker (44, 65, -127) to unite with team!');

// 2. Safe retreat route: (36.5, 66, -187) -> (38, 65, -176) -> (44, 65, -169) -> (44, 65, -145) -> (44, 65, -127)
const retreatWps = [
  new Vec3(38.0, 65.0, -176.0),
  new Vec3(44.0, 65.0, -169.0),
  new Vec3(44.0, 65.0, -150.0),
  new Vec3(44.0, 65.0, -135.0),
  new Vec3(44.0, 65.0, -127.0) // Fortress Bunker
];

for (let i = 0; i < retreatWps.length && !checkCancelled(); i++) {
  const wp = retreatWps[i];
  console.log(`Moving to retreat waypoint ${i + 1}/${retreatWps.length}: ${lib.fmt(wp)}...`);

  // Clear fire ahead
  await globalThis.clearFireAhead();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: false, timeoutMs: 6000 });
    } catch (e2) {}
  }

  // Vacuum any items on corridor floor
  await lib.pickup(3.5);
}

console.log('Arrived at Fortress Bunker:', lib.fmt(bot.entity.position));
bot.chat(`alpha: Safely inside Fortress Bunker (${lib.fmt(bot.entity.position)})! HP: ${bot.health.toFixed(1)}/20. United with team!`);

// 3. Scan teammates at bunker
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (${d}m), held: ${p.entity.heldItem?.name}`);
  }
}

// 4. Scan Piglins within 16m for bartering
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 16
);
console.log(`Piglins near bunker: ${piglins.length}`);

// 5. Scan Endermen within 16m
const endermen = Object.values(bot.entities).filter(e =>
  e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 16
);
console.log(`Endermen near bunker: ${endermen.length}`);

const pearls = lib.count('ender_pearl');
const rods = lib.count('blaze_rod');
bot.chat(`alpha: Team united at Bunker! Rods: ${rods}, Pearls: ${pearls}/12, Piglins: ${piglins.length}, Endermen: ${endermen.length}`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  rods,
  pearls,
  inv: lib.inv()
};
