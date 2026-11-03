console.log('=== Program 938: Cooperative Barter Vacuum & Pearl Tracking ===');
globalThis.isProgramCancelled = isCancelled;

// Ensure golden boots equipped
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}

console.log('Beta start position:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Current Ender Pearls:', lib.count('ender_pearl'));

bot.chat(`Beta: Standing by at Piglin post (43, 67, -117). We hold ${lib.count('ender_pearl')}/12 Ender Pearls. Ready to vacuum Gamma's barters!`);

const startTime = Date.now();
let lastPearls = lib.count('ender_pearl');

// Monitor for 40 seconds, vacuuming periodically
while (Date.now() - startTime < 40000 && !isCancelled()) {
  await sleep(2500);
  
  // Safe vacuum around the piglin cluster
  try {
    await lib.pickup(6.0);
  } catch (e) {}

  const curPearls = lib.count('ender_pearl');
  if (curPearls > lastPearls) {
    bot.chat(`Beta: Acquired Ender Pearls! Total now: ${curPearls}/12!`);
    console.log(`Pearls increased to ${curPearls}/12!`);
    lastPearls = curPearls;
  }

  if (curPearls >= 12) {
    bot.chat(`Beta: MILESTONE 9 IS 100% COMPLETE! ${curPearls} Ender Pearls secured! Moving to Milestone 10!`);
    console.log(`MILESTONE 9 100% COMPLETE! Pearls: ${curPearls}`);
    break;
  }

  // Log nearby players
  const teammates = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
  for (const t of teammates) {
    console.log(`  ${t.username} at ${lib.fmt(t.entity.position)}, dist=${bot.entity.position.distanceTo(t.entity.position).toFixed(1)}m`);
  }
}

const finalPearls = lib.count('ender_pearl');
console.log(`Program 938 finished. Final Pearls: ${finalPearls}/12. Final Inv:`, JSON.stringify(lib.inv()));

return {
  pearls: finalPearls,
  inv: lib.inv(),
  hp: bot.health,
  pos: bot.entity.position
};
