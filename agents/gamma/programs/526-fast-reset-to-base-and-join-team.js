// programs/526-fast-reset-to-base-and-join-team.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 526: FAST RESET TO BASE & JOIN TEAM ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step off ledge at y=66 into y=53 to trigger fast bed respawn
if (bot.health < 5 && bot.game.dimension === 'the_nether') {
  bot.clearControlStates();
  bot.pathfinder.stop();
  // Turn toward open drop
  await bot.lookAt(new Vec3(35.0, 50.0, -180.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);

  const startWait = Date.now();
  while (bot.health < 15 && Date.now() - startWait < 8000 && !isCancelled()) {
    await sleep(250);
  }
}

console.log('Post-reset State:');
console.log('Dimension:', bot.game.dimension);
console.log('Position:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', lib.inv());

// Check players nearby in Overworld
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (${d}m), held: ${p.entity.heldItem?.name}`);
  }
}

// Check Base Chest contents
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base Chest contents:', JSON.stringify(contents));
  // If cooked food or gold in chest, withdraw
  for (const fn of ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread']) {
    if (contents && contents[fn] > 0) {
      await lib.withdraw({ [fn]: Math.min(contents[fn], 16) }, 293, 72, -57);
      console.log(`Withdrew ${fn} from chest!`);
    }
  }
  if (contents && contents.gold_ingot > 0) {
    await lib.withdraw({ gold_ingot: Math.min(contents.gold_ingot, 16) }, 293, 72, -57);
    console.log('Withdrew gold_ingot from chest!');
  }
} catch (e) {
  console.log('Chest check note:', e.message);
}

// Ensure quickRegear (golden_boots on feet, shield in offhand, sword equipped)
await globalThis.quickRegear({ cobble: 4 });

bot.chat(`gamma: At Overworld base! HP: ${bot.health}/20, Food: ${bot.food}/20, Gold ingots: ${lib.count('gold_ingot')}. Teaming up with Beta/Delta for Milestone 9 Ender Pearls!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  goldIngots: lib.count('gold_ingot'),
  inv: lib.inv()
};
