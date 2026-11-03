// programs/709-dig-staircase-to-surface.js
console.log('=== Program 709: Dig Staircase to Surface & Enter Portal ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

bot.clearControlStates();
bot.pathfinder.stop();

const sp = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (sp) await bot.equip(sp, 'hand');

// Staircase heading east towards x=299:
// Current pos is ~298, y=49. We want to ascend to y=72 at x=299.
console.log('Digging staircase upwards toward surface at y=72...');

while (bot.entity.position.y < 72 && !isCancelled()) {
  const curY = Math.floor(bot.entity.position.y);
  const curX = Math.floor(bot.entity.position.x);
  const curZ = Math.floor(bot.entity.position.z);

  // Dig block above head (curY + 2) and (curY + 3)
  for (let dy = 2; dy <= 3; dy++) {
    const b = bot.blockAt(new Vec3(curX, curY + dy, curZ));
    if (b && b.boundingBox === 'block') {
      try { await bot.dig(b, true); await sleep(50); } catch (e) {}
    }
  }

  // Also dig block ahead at curX+1 or curZ
  const nextTarget = new Vec3(curX, curY + 2, curZ);
  // Jump and place block under feet or climb up
  const below = bot.blockAt(new Vec3(curX, curY, curZ));
  bot.setControlState('jump', true);
  await sleep(150);
  try {
    const mat = lib.count('cobblestone') > 0 ? 'cobblestone' : 'dirt';
    if (lib.count(mat) > 0) {
      await lib.place(mat, curX, curY, curZ);
    }
  } catch (e) {}
  bot.setControlState('jump', false);
  await sleep(100);

  // If stuck towering, use lib.goTo to step up
  try {
    await lib.goTo(curX, curY + 1, curZ, 0.5, { dig: true, timeoutMs: 2500 });
  } catch (e) {}

  console.log(`Current Y: ${bot.entity.position.y.toFixed(1)}`);
  if (bot.entity.position.y >= 70) break;
}

console.log('Ascent complete! Pos:', lib.fmt(bot.entity.position));

// Once on surface (y >= 70), enter Nether portal at (299.5, 73.0, -54.0)
if (bot.entity.position.y >= 70) {
  console.log('Entering Nether Portal at (299.5, 73.0, -54.0)...');
  try {
    await lib.goTo(299.5, 73.0, -54.0, 0.8, { timeoutMs: 8000 });
  } catch (e) {}

  const portalTarget = new Vec3(299.5, 73.0, -54.0);
  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (cur.distanceTo(portalTarget) > 0.8) {
      await bot.lookAt(portalTarget, true);
      bot.setControlState('forward', true);
      if (cur.y < 72.8) bot.setControlState('jump', true);
      await sleep(250);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(350);
  }
  bot.clearControlStates();
}

console.log('Program 709 complete. Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  hp: bot.health
};
