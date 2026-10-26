// programs/217-tunnel-towards-spawner-pillar.js
console.log('Delta pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Gear:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.pathfinder.stop();
await sleep(300);

const targetWaypoints = [
  { x: 44, z: -161 },
  { x: 43, z: -162 },
  { x: 43, z: -163 },
  { x: 42, z: -164 },
  { x: 42, z: -165 },
  { x: 41, z: -166 },
  { x: 41, z: -167 },
  { x: 40, z: -168 },
  { x: 40, z: -169 },
  { x: 39, z: -170 },
  { x: 39, z: -171 },
  { x: 38, z: -172 },
  { x: 38, z: -173 },
  { x: 37, z: -174 },
  { x: 37, z: -175 }
];

bot.chat('delta: Inside solid mountain rock at z=-160! Tunneling directly towards Blaze Spawner pillar at (32, 65, -190)...');

for (const step of targetWaypoints) {
  if (isCancelled()) break;
  const x = step.x;
  const z = step.z;
  console.log(`Tunneling to (${x}, 65, ${z})...`);

  // Ensure solid floor at y=64
  const floor = bot.blockAt(new Vec3(x, 64, z));
  if (!floor || floor.name === 'air' || floor.name === 'cave_air') {
    try {
      const mat = lib.count('netherrack') > 0 ? 'netherrack' : (lib.count('cobblestone') > 0 ? 'cobblestone' : 'dirt');
      await lib.place(mat, x, 64, z);
    } catch (e) {}
  }

  // Dig head block at y=66
  const head = bot.blockAt(new Vec3(x, 66, z));
  if (head && head.name !== 'air' && head.name !== 'cave_air') {
    try {
      await lib.dig(x, 66, z);
    } catch (e) {}
  }

  // Dig feet block at y=65
  const feet = bot.blockAt(new Vec3(x, 65, z));
  if (feet && feet.name !== 'air' && feet.name !== 'cave_air') {
    try {
      await lib.dig(x, 65, z);
    } catch (e) {}
  }

  // Step forward into dug space
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(x, 65, z));
    console.log(`Stepped to (${x}, 65, ${z})!`);
  } catch (e) {
    await bot.lookAt(new Vec3(x + 0.5, 65.0, z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(350);
    bot.setControlState('forward', false);
  }
}

const spawnerTarget = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawnerTarget);
console.log(`Current pos: ${lib.fmt(bot.entity.position)}, Distance to Blaze Spawner: ${dist.toFixed(1)}m`);
bot.chat(`delta: Mountain tunnel advanced to ${lib.fmt(bot.entity.position)}! Only ${dist.toFixed(1)}m to Blaze Spawner pillar (32, 65, -190)!`);
console.log('Final inventory:', JSON.stringify(lib.inv()));
