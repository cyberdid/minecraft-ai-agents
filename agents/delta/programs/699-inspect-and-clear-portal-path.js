console.log('=== PROGRAM 699: INSPECT PATH TO PORTAL 2 (41, 65, -7) ===');

for (let x = 63; x >= 41; x -= 2) {
  const bFloor = bot.blockAt(new Vec3(x, 64, -7));
  const bFeet = bot.blockAt(new Vec3(x, 65, -7));
  const bHead = bot.blockAt(new Vec3(x, 66, -7));
  console.log(`x=${x}, z=-7: floor=${bFloor?.name}, feet=${bFeet?.name}, head=${bHead?.name}`);
}

// Dig any blocks obstructing feet or head along x=63 down to x=41
for (let x = Math.floor(bot.entity.position.x); x >= 41; x--) {
  const feet = bot.blockAt(new Vec3(x, 65, -7));
  const head = bot.blockAt(new Vec3(x, 66, -7));
  if (feet && feet.name !== 'air' && feet.name !== 'cave_air' && feet.name !== 'nether_portal') {
    console.log(`Digging feet obstruction at (${x}, 65, -7): ${feet.name}`);
    await bot.dig(feet);
  }
  if (head && head.name !== 'air' && head.name !== 'cave_air' && head.name !== 'nether_portal') {
    console.log(`Digging head obstruction at (${x}, 66, -7): ${head.name}`);
    await bot.dig(head);
  }
}

// Now walk directly forward along z=-7 to x=41.5
console.log('Walking straight West to Portal at (41, 65, -7)...');
await bot.lookAt(new Vec3(41.5, 65.5, -7.0), true);
bot.setControlState('forward', true);
const walkStart = Date.now();
while (bot.entity.position.x > 42.0 && Date.now() - walkStart < 8000) {
  if (bot.entity.isCollidedHorizontally) {
    bot.setControlState('jump', true);
    await sleep(200);
    bot.setControlState('jump', false);
  }
  await sleep(100);
}
bot.setControlState('forward', false);

console.log('Arrived at portal area! Current pos:', lib.fmt(bot.entity.position));

// Step into portal block at (41, 65, -7)
const portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 6 });
if (portal) {
  console.log(`Stepping into portal block at ${lib.fmt(portal.position)}...`);
  await bot.lookAt(portal.position.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);

  console.log('Waiting for warp to Overworld...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000) {
    await sleep(250);
  }
}

console.log('Dimension after warp:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
bot.chat(`delta: Dim=${bot.game.dimension}, Pos=${lib.fmt(bot.entity.position)}.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
