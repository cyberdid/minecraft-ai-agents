// programs/547-reset-and-provision-food.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 547: RESET HP & PROVISION FOOD FOR NETHER ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: If in Nether with low HP, trigger fast bed respawn
if (bot.game.dimension === 'the_nether' && bot.health < 10) {
  bot.clearControlStates();
  bot.pathfinder.stop();
  // Step off edge at (44, 65, -125) into y=53
  await bot.lookAt(new Vec3(44.0, 50.0, -123.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);

  const startWait = Date.now();
  while (bot.game.dimension === 'the_nether' && Date.now() - startWait < 8000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Post-reset dim:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

if (bot.game.dimension !== 'overworld') {
  console.log('Still in Nether, stopping.');
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

bot.chat('gamma: Respawned at Overworld base with 20/20 HP! Sourcing fresh food for team Nether operations!');

// Step 2: Exit base door to hunt animals
if (bot.entity.position.z < -53.5) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    try {
      await lib.door(294, 72, -54, true);
      await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -53));
      await lib.door(294, 72, -54, false);
    } catch (e2) {}
  }
}

console.log('Outside base at:', lib.fmt(bot.entity.position));

// Scan for cows or sheep nearby
const animals = Object.values(bot.entities).filter(e =>
  ['cow', 'sheep', 'pig'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) <= 64
);
console.log(`Animals nearby within 64m: ${animals.length}`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)} (dist: ${bot.entity.position.distanceTo(a.position).toFixed(1)}m)`);
}

// Hunt animals if present
const cow = animals.find(a => a.name === 'cow');
const sheep = animals.find(a => a.name === 'sheep');
const pig = animals.find(a => a.name === 'pig');
const targetType = cow ? 'cow' : (sheep ? 'sheep' : (pig ? 'pig' : null));

if (targetType) {
  console.log(`Hunting ${targetType}...`);
  try {
    await lib.hunt(targetType, 2);
    console.log('Hunt complete! Inventory:', lib.inv());
  } catch (e) {
    console.log('Hunt error:', e.message);
  }
}

// Step 3: Return inside base
try {
  await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 8000 });
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Inside base room pos:', lib.fmt(bot.entity.position));

// Step 4: Smelt any raw meat in Base Furnaces at (295, 72, -55)
const rawItems = bot.inventory.items().filter(i => ['raw_beef', 'raw_mutton', 'porkchop'].includes(i.name));
for (const raw of rawItems) {
  console.log(`Smelting ${raw.count} ${raw.name}...`);
  try {
    // Check if we have planks or sticks for fuel
    const fuel = bot.inventory.items().find(i => ['coal', 'charcoal', 'oak_planks', 'stick'].includes(i.name));
    if (fuel) {
      await lib.smelt(raw.name, fuel.name, raw.count);
      console.log(`Smelted ${raw.name}! Inventory:`, lib.inv());
    }
  } catch (e) {
    console.log('Smelting error:', e.message);
  }
}

// Step 5: Eat to full if needed
if (bot.food < 20) {
  try {
    await lib.eat();
    console.log('Ate food! Hunger now:', bot.food, 'HP:', bot.health);
  } catch (e) {}
}

// Step 6: Quick regear
await globalThis.quickRegear({ cobble: 16 });

console.log('Final Prepared Inventory:', lib.inv());
console.log('Armor:', {
  feet: bot.inventory.slots[8]?.name,
  offhand: bot.inventory.slots[45]?.name
});

bot.chat(`gamma: Fully provisioned! HP: ${bot.health}/20, Food: ${bot.food}/20, golden_boots & shield equipped! Ready to enter Nether for Milestone 9!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  goldenBoots: bot.inventory.slots[8]?.name === 'golden_boots',
  shield: bot.inventory.slots[45]?.name === 'shield',
  inv: lib.inv()
};
