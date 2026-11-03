console.log('=== Program 974: Scan Base Area for Food Sources ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);

// Scan entities for animals
const animals = Object.values(bot.entities).filter(e =>
  e.isValid && ['sheep', 'cow', 'pig', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) <= 48
);

console.log(`Animals within 48m: ${animals.length}`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)}, dist=${bot.entity.position.distanceTo(a.position).toFixed(1)}m`);
}

// Scan for wheat crops or hay bales
const crops = bot.findBlocks({ matching: b => b && (b.name === 'wheat' || b.name === 'hay_block' || b.name === 'carrots' || b.name === 'potatoes'), maxDistance: 32, count: 10 });
console.log(`Crops / Food blocks within 32m: ${crops.length}`);
for (const c of crops) {
  const b = bot.blockAt(c);
  console.log(`  ${b.name} at ${lib.fmt(c)}`);
}

// If animals found within 25m, hunt 1 for meat
if (animals.length > 0 && bot.food < 18) {
  const target = animals[0];
  console.log(`Hunting ${target.name} at ${lib.fmt(target.position)}...`);
  try {
    const sword = bot.inventory.items().find(i => i.name.includes('sword'));
    if (sword) await bot.equip(sword, 'hand');
    await bot.pathfinder.goto(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2.0));
    await bot.lookAt(target.position.offset(0, 0.8, 0), true);
    bot.attack(target);
    await sleep(650);
    bot.attack(target);
    await sleep(650);
    await lib.pickup(4.0);
  } catch (e) {
    console.log('Hunt error:', e.message);
  }
}

// Return to base interior
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}
try {
  await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 0.8));
} catch (e) {}

// If holding raw meat, smelt in furnace at (295, 72, -55)
const rawMeat = bot.inventory.items().find(i => ['mutton', 'beef', 'porkchop', 'chicken'].includes(i.name));
if (rawMeat) {
  console.log(`Smelting ${rawMeat.name}...`);
  try {
    await lib.smelt(rawMeat.name, 'cobblestone', rawMeat.count); // or oak_planks
  } catch (e) {
    console.log('Smelt notice:', e.message);
  }
}

return {
  pos: bot.entity.position,
  food: bot.food,
  hp: bot.health,
  animalsFound: animals.length,
  inv: lib.inv()
};
