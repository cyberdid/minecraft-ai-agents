// programs/482-place-step-and-warp.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// Inspect portal frame blocks
for (let y = 72; y <= 74; y++) {
  let row = `y=${y}: `;
  for (let x = 298; x <= 301; x++) {
    for (let z = -55; z <= -53; z++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air') row += `(${x},${z}:${b.name}) `;
    }
  }
  console.log(row);
}

// Ensure step block at (299, 72, -55) so players can walk up to y=73
const stepBlock = bot.blockAt(new Vec3(299, 72, -55));
console.log('Block at (299, 72, -55):', stepBlock?.name);

if (stepBlock && stepBlock.name === 'air') {
  // Place a block at (299, 72, -55) against (299, 71, -55) or (299, 72, -54)
  const ref = bot.blockAt(new Vec3(299, 71, -55)) || bot.blockAt(new Vec3(299, 72, -54));
  if (ref) {
    try {
      const plank = bot.inventory.items().find(i => i.name.includes('planks'));
      if (plank) {
        await bot.equip(plank, 'hand');
        await bot.placeBlock(ref, new Vec3(0, 1, 0));
        console.log('Placed step block at (299, 72, -55)!');
      }
    } catch (e) {
      console.log('Step block note:', e.message);
    }
  }
}

// Now jump up onto the portal frame sill (299.5, 73.0, -54.0)
console.log('Jumping onto portal sill (299.5, 73.0, -54.0)...');
bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

const sillTarget = new Vec3(299.5, 73.0, -54.0);
await bot.lookAt(sillTarget.offset(0, 0.8, 0), true);

bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(400);
bot.setControlState('jump', false);
await sleep(300);
bot.setControlState('forward', false);
bot.clearControlStates();

console.log('Position after jumping into frame:', lib.fmt(bot.entity.position));

// Hold position until warped
const warpStart = Date.now();
while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 15000) {
  if (bot.entity.position.y < 72.8) {
    bot.setControlState('jump', true);
    await sleep(200);
    bot.setControlState('jump', false);
  }
  await sleep(350);
}

console.log('Warp result: dim=', bot.game.dimension, 'pos=', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat('delta: In the_nether at y=65! Advancing to East Ridge gold veins for Milestone 9!');
  await sleep(500);
  await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
