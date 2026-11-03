console.log('=== Program 931: Direct Piglin Barter ===');
globalThis.isProgramCancelled = isCancelled;

const gold = bot.inventory.items().find(i => i.name === 'gold_ingot');
if (!gold) {
  console.log('No gold ingots!');
  return;
}

const piglin = Object.values(bot.entities).find(e =>
  e.isValid && e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 3.0
);

if (piglin) {
  console.log(`Directly interacting with Piglin id=${piglin.id} at ${lib.fmt(piglin.position)}...`);
  
  // Equip gold ingot in main hand
  await bot.equip(gold, 'hand');
  await bot.lookAt(piglin.position.offset(0, 1.2, 0), true);

  const goldBefore = lib.count('gold_ingot');
  console.log('Gold before interaction:', goldBefore);

  bot.activateEntity(piglin);
  await sleep(500);

  const goldAfter = lib.count('gold_ingot');
  console.log('Gold after interaction:', goldAfter);

  if (goldAfter < goldBefore) {
    console.log('SUCCESS: Piglin accepted gold ingot directly! Waiting 8.5s for barter drop...');
    bot.chat(`Beta: Direct barter successful! Piglin is admiring gold ingot...`);
    await sleep(8500);
    await lib.pickup(4.0);
  } else {
    console.log('Direct interaction did not consume ingot. Tossing ingot directly onto Piglin block...');
    await bot.lookAt(piglin.position.offset(0, 0.1, 0), true);
    await bot.toss(gold.type, null, 1);
    console.log('Waiting 8.5s for Piglin to pick up and admire...');
    await sleep(8500);
    await lib.pickup(4.0);
  }

  const pearls = lib.count('ender_pearl');
  console.log(`Current Ender Pearls: ${pearls}`);
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  inv: lib.inv()
};
