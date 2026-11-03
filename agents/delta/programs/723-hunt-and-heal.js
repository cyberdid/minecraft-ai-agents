// programs/723-hunt-and-heal.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 723: SCAN & HUNT ANIMALS FOR HEALING ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Check animals within 48m
const animals = Object.values(bot.entities).filter(e =>
  ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) <= 48
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Found ${animals.length} animals within 48m.`);
for (const a of animals) {
  console.log(`- ${a.name} at ${lib.fmt(a.position)}, dist=${bot.entity.position.distanceTo(a.position).toFixed(1)}m`);
}

// If animals found, hunt up to 2 animals
if (animals.length > 0) {
  for (let i = 0; i < Math.min(2, animals.length); i++) {
    const target = animals[i];
    console.log(`Hunting ${target.name} at ${lib.fmt(target.position)}...`);
    try {
      await bot.equip(mcData.itemsByName.iron_sword.id, 'hand');
    } catch (e) {}
    try {
      await bot.pathfinder.goto(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2.0));
      while (target.isValid && bot.entity.position.distanceTo(target.position) <= 4.0) {
        await bot.lookAt(target.position.offset(0, target.height * 0.6, 0), true);
        bot.attack(target);
        await sleep(650);
      }
      await lib.pickup(5.0);
    } catch (e) {
      console.log('Hunt error:', e.message);
    }
  }
}

// Return into base house
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(293, 72, -55, 1); } catch (e2) {}
}

console.log('Delta Inv after hunting:', lib.inv());
