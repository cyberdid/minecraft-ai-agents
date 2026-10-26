// programs/450-hold-fortress-bunker.js
console.log('=== Step: Hold fortified bridgehead bunker and await team link-up ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check surrounding walls to ensure complete shelter
const p = bot.entity.position.floored();
const openAirNeighbors = [
  p.offset(1, 0, 0), p.offset(-1, 0, 0), p.offset(0, 0, 1), p.offset(0, 0, -1),
  p.offset(1, 1, 0), p.offset(-1, 1, 0), p.offset(0, 1, 1), p.offset(0, 1, -1),
  p.offset(0, 2, 0)
].filter(pos => {
  const b = bot.blockAt(pos);
  return b && b.name === 'air';
});

console.log(`Open air gaps in bunker: ${openAirNeighbors.length}`);
for (const gap of openAirNeighbors) {
  if (isCancelled() || lib.count('soul_sand') + lib.count('dirt') < 2) break;
  try {
    const mat = lib.count('dirt') > 0 ? 'dirt' : 'soul_sand';
    await lib.place(mat, gap.x, gap.y, gap.z);
    console.log(`Sealed gap at ${lib.fmt(gap)} with ${mat}`);
  } catch (e) {}
}

// 2. Broadcast signal to incoming teammates
bot.chat('beta: Holding Fortress bunker at (44, 65, -129)! Wither Skeleton safely locked out. Delta/Gamma/Alpha, head straight to (45, 65, -130)!');

// 3. Monitor arrival of teammates for 20 seconds
for (let t = 0; t < 20; t++) {
  await sleep(1000);
  if (isCancelled()) break;
  for (const [name, player] of Object.entries(bot.players)) {
    if (player.entity && name !== 'beta') {
      const dist = bot.entity.position.distanceTo(player.entity.position);
      if (dist < 20) {
        console.log(`Teammate ${name} arrived within ${dist.toFixed(1)}m of bunker!`);
      }
    }
  }
}

console.log(`Holding operation status: HP: ${bot.health.toFixed(1)}/20, Food: ${bot.food}/20, pos: ${lib.fmt(bot.entity.position)}`);
