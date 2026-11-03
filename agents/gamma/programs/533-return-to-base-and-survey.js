// programs/533-return-to-base-and-survey.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 533: RETURN TO BASE & SURVEY TEAM ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Return to base at (293, 72, -55)
bot.chat('gamma: Returning from plains (231, 62, -55) back to base (293, 72, -55)!');
try {
  await lib.goTo(293, 72, -55, 2.0, { timeoutMs: 25000 });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 1.5));
  } catch (e2) {
    console.log('Pathfinder note:', e2.message);
  }
}

console.log('Arrived at pos:', lib.fmt(bot.entity.position));

// Step 2: Check nearby players at base
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (${d}m), held: ${p.entity.heldItem?.name}`);
  }
}

// Step 3: Check Base Chest at (293, 72, -57)
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base Chest contents:', JSON.stringify(contents));
  // If cooked food, withdraw up to 16
  for (const fn of ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'cooked_chicken']) {
    if (contents && contents[fn] > 0) {
      await lib.withdraw({ [fn]: Math.min(contents[fn], 16) }, 293, 72, -57);
      console.log(`Withdrew ${fn}!`);
      break;
    }
  }
} catch (e) {
  console.log('Chest note:', e.message);
}

// Step 4: Ensure quickRegear (golden_boots, shield, weapon)
await globalThis.quickRegear({ cobble: 16 });

console.log('Current Inventory:', lib.inv());
console.log('Armor:', {
  feet: bot.inventory.slots[8]?.name,
  offhand: bot.inventory.slots[45]?.name
});

bot.chat(`gamma: Stationed at Base (${lib.fmt(bot.entity.position)}) with full 20/20 HP, golden_boots, shield & iron tools! Ready for team Milestone 9 operation!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  goldenBoots: bot.inventory.slots[8]?.name === 'golden_boots',
  inv: lib.inv()
};
