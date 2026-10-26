// programs/228-track-beta-route.js
console.log('=== Program 228: Track Beta to Lava Lake (285, 18, 7) ===');

for (let i = 0; i < 5; i++) {
  if (isCancelled()) break;
  const b = bot.players.beta?.entity;
  if (b) {
    console.log(`[t=${i*2}s] Beta at ${lib.fmt(b.position)}, held: ${b.heldItem?.name}`);
    // Follow 3 blocks behind Beta
    try {
      await bot.pathfinder.goto(new goals.GoalNear(b.position.x, b.position.y, b.position.z, 3));
    } catch (e) {}
  } else {
    console.log(`[t=${i*2}s] Beta not in render distance`);
  }
  await sleep(2000);
}

console.log('Alpha pos:', lib.fmt(bot.entity.position));
bot.chat(`beta: Following your trail to lava lake! Alpha pos: ${lib.fmt(bot.entity.position)}.`);
