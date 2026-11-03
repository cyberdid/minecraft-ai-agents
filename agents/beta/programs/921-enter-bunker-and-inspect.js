console.log('=== Program 921: Enter Bunker & Inspect ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Starting pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Step through the 2-high doorway into the bunker at (44, 65, -130)
const target = new Vec3(44.0, 65.0, -130.0);
console.log(`Moving into Bunker at ${lib.fmt(target)}...`);

try {
  await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 0.8));
} catch (e) {
  await bot.lookAt(target, true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.clearControlStates();
}

console.log('Inside Bunker! Pos:', lib.fmt(bot.entity.position));

// Scan teammates
for (const p of Object.values(bot.players)) {
  if (p.entity) {
    console.log(`Teammate ${p.username}: pos=${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

// Scan for Piglins in covered tunnel
const piglins = Object.values(bot.entities).filter(e =>
  e.isValid && (e.name === 'piglin' || e.name === 'piglin_brute') && bot.entity.position.distanceTo(e.position) <= 32
);
console.log(`Nearby Piglins (${piglins.length}):`);
for (const pig of piglins) {
  console.log(`  ${pig.name} at ${lib.fmt(pig.position)}, dist=${bot.entity.position.distanceTo(pig.position).toFixed(1)}m`);
}

// Scan for Endermen
const endermen = Object.values(bot.entities).filter(e =>
  e.isValid && e.name === 'enderman' && bot.entity.position.distanceTo(e.position) <= 48
);
console.log(`Nearby Endermen (${endermen.length}):`);
for (const end of endermen) {
  console.log(`  Enderman at ${lib.fmt(end.position)}, dist=${bot.entity.position.distanceTo(end.position).toFixed(1)}m`);
}

// Check crafting table
const ct = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 16 });
if (ct) {
  console.log(`Crafting table at ${lib.fmt(ct.position)}`);
}

bot.chat(`Beta: Safely inside Fortress Workshop Bunker at ${lib.fmt(bot.entity.position)}! Ready to pool gold & barter for Ender Pearls!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  piglins: piglins.length,
  endermen: endermen.length,
  crafting_table: ct ? lib.fmt(ct.position) : null
};
