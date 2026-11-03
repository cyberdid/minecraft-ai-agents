// programs/565-obtain-flint.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: OBTAIN FLINT FROM GRAVEL ===');

let flintCount = lib.count('flint');
console.log(`Initial flint: ${flintCount}`);

for (let round = 0; round < 6 && lib.count('flint') === 0 && !isCancelled(); round++) {
  const gravelBlocks = bot.findBlocks({
    matching: b => b && b.name === 'gravel',
    maxDistance: 16,
    count: 6
  });

  if (gravelBlocks.length === 0) {
    console.log('No gravel found within 16m.');
    break;
  }

  for (const gp of gravelBlocks) {
    if (lib.count('flint') > 0 || isCancelled()) break;
    const gb = bot.blockAt(gp);
    if (gb) {
      console.log(`Digging gravel at ${lib.fmt(gp)}...`);
      try {
        await bot.pathfinder.goto(new goals.GoalNear(gp.x, gp.y, gp.z, 2));
        await bot.dig(gb);
        await sleep(300);
        await lib.pickup(3.5);
      } catch (e) {
        console.log('Gravel dig notice:', e.message);
      }
    }
  }
}

try { await lib.pickup(4); } catch (e) {}

console.log(`Flint in inventory: ${lib.count('flint')}`);
return { flint: lib.count('flint'), inv: lib.inv() };
