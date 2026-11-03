// programs/464-tower-out-of-hole.js
console.log('=== TOWER OUT OF HOLE & STEP TO PORTAL (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Check surrounding blocks
for (let dy = -1; dy <= 8; dy++) {
  const p = bot.entity.position.offset(0, dy, 0).floored();
  console.log(`y=${p.y}: ${bot.blockAt(p)?.name}`);
}

// 2. Tower straight up to y = 72 using soul_sand
const blockItem = bot.inventory.items().find(i => i.name === 'soul_sand' || i.name === 'cobblestone');
if (blockItem) {
  console.log(`Towering up with ${blockItem.name}...`);
  await bot.equip(blockItem, 'hand');

  const startY = bot.entity.position.y;
  let safety = 0;
  while (bot.entity.position.y < 71.8 && safety < 12 && !isCancelled()) {
    safety++;
    const under = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if (under) {
      await bot.lookAt(bot.entity.position.offset(0, -1, 0), true);
      bot.setControlState('jump', true);
      await sleep(250);
      try {
        await bot.placeBlock(under, new Vec3(0, 1, 0));
      } catch (e) {
        // try alternative place
        try { await lib.place(blockItem.name, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z); } catch (e2) {}
      }
      bot.setControlState('jump', false);
      await sleep(200);
    }
  }
}

bot.clearControlStates();
console.log('Post-tower pos:', lib.fmt(bot.entity.position));

// 3. Seal the hole underfoot so no one falls in again!
console.log('Sealing hole...');
try {
  const under = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  if (under && under.name === 'air') {
    await lib.place('cobblestone', under.position.x, under.position.y, under.position.z);
  }
} catch (e) {}

// 4. Walk safely across surface at y >= 71 to portal sill at (299.5, 72.0, -52.5)
console.log('Walking across surface to portal sill...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(299.5, 72.0, -52.5, 0.8));
} catch (e) {
  console.log('Path to sill note:', e.message);
}

console.log('At portal sill! Pos:', lib.fmt(bot.entity.position));

// 5. Step into portal
const target = new Vec3(299.5, 73.0, -53.5);
await bot.lookAt(target, true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1000);
bot.setControlState('jump', false);
bot.setControlState('forward', false);
bot.clearControlStates();

console.log('Inside portal frame! Awaiting warp...');
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 15000 && !isCancelled()) {
  await sleep(250);
}

console.log('Final dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health
};
