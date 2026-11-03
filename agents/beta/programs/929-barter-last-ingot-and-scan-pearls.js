console.log('=== Program 929: Barter with Adjacent Piglin ===');
globalThis.isProgramCancelled = isCancelled;

const gold = bot.inventory.items().find(i => i.name === 'gold_ingot');
console.log('Gold in inventory:', gold ? gold.count : 0);

const piglin = Object.values(bot.entities).find(e =>
  e.isValid && e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 2.5
);

if (gold && piglin) {
  console.log(`Bartering 1 gold ingot with Piglin id=${piglin.id} at ${lib.fmt(piglin.position)} (dist: ${bot.entity.position.distanceTo(piglin.position).toFixed(1)}m)...`);
  
  // Toss directly at Piglin feet
  await bot.lookAt(piglin.position.offset(0, 0.2, 0), true);
  await bot.toss(gold.type, null, 1);
  bot.chat(`Beta: Barter round with adjacent Piglin id=${piglin.id}! Waiting for drop...`);
  
  console.log('Tossed gold ingot. Waiting 8.5s for Piglin inspection and trade...');
  await sleep(8500);

  // Step directly onto drop spot and vacuum
  await bot.lookAt(piglin.position, true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.clearControlStates();
  
  await lib.pickup(4.0);

  const pearls = lib.count('ender_pearl');
  console.log(`Barter drop vacuumed! Ender Pearls in inventory: ${pearls}`);
  if (pearls > 0) {
    bot.chat(`Beta: ENDER PEARL HARVESTED! Total: ${pearls}/12!`);
  }
} else {
  console.log(`Cannot barter: gold=${gold ? gold.count : 0}, piglin=${piglin ? piglin.id : 'none'}`);
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`Beta: Barter complete. Pearls: ${lib.count('ender_pearl')}/12, Remaining Gold: ${lib.count('gold_ingot')}`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  inv: lib.inv()
};
