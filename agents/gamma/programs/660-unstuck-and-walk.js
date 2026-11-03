// programs/660-unstuck-and-walk.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 660: UNSTUCK & DIRECT NAVIGATION ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'onGround:', bot.entity.onGround);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// Inspect blocks in 3x3x3 around gamma
const pos = bot.entity.position.floored();
console.log('Surrounding 3x3 at y=64..66:');
for (let dy = 2; dy >= -1; dy--) {
  let line = `y=${pos.y + dy}: `;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const b = bot.blockAt(pos.offset(dx, dy, dz));
      line += `[${dx},${dz}:${b ? b.name : 'null'}] `;
    }
  }
  console.log(line);
}

// Clear head and feet if solid
const feet = bot.blockAt(bot.entity.position);
const head = bot.blockAt(bot.entity.position.offset(0, 1, 0));
console.log('Feet block:', feet?.name, 'Head block:', head?.name);
if (head && head.boundingBox === 'block') {
  console.log('Digging head block...');
  await bot.dig(head, true);
}
if (feet && feet.boundingBox === 'block') {
  console.log('Digging feet block...');
  await bot.dig(feet, true);
}

// Try small jump & step west
console.log('Testing step west towards x=60...');
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await bot.lookAt(new Vec3(50, 65, -8), true);
await sleep(1000);
bot.clearControlStates();
console.log('Pos after test step:', lib.fmt(bot.entity.position));

return {
  pos: bot.entity.position,
  blaze_powder: lib.count('blaze_powder')
};
