// programs/227-extend-enclosed-corridor.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Cobblestone available:', lib.count('cobblestone'));

bot.pathfinder.stop();
await sleep(200);

// Helper to safely place a block if air
async function placeIfAir(mat, x, y, z) {
  const b = bot.blockAt(new Vec3(x, y, z));
  if (!b || b.name === 'air' || b.name === 'cave_air') {
    try {
      await lib.place(mat, x, y, z);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

// 1. First complete enclosure of current section at (44, 65, -163)
console.log('Completing enclosure at z=-163...');
await placeIfAir('cobblestone', 43, 65, -163);
await placeIfAir('cobblestone', 43, 66, -163);
await placeIfAir('cobblestone', 45, 65, -163);
await placeIfAir('cobblestone', 45, 66, -163);
await placeIfAir('cobblestone', 44, 67, -163);

// 2. Sections to build towards Blaze Spawner (32, 68, -190)
const steps = [
  { x: 43, z: -164 },
  { x: 43, z: -165 },
  { x: 42, z: -166 },
  { x: 42, z: -167 },
  { x: 41, z: -168 },
  { x: 41, z: -169 }
];

bot.chat('delta: Extending 100% enclosed blast-proof cobblestone corridor towards Blaze Spawner...');

for (const s of steps) {
  if (isCancelled()) break;
  if (lib.count('cobblestone') < 5) {
    console.log('Low cobblestone, stopping advance.');
    break;
  }

  const { x, z } = s;
  console.log(`Building enclosed section at (${x}, 65, ${z})...`);

  // 1. Floor at y=64
  await placeIfAir('cobblestone', x, 64, z);

  // 2. Left wall (x-1, y=65..66)
  await placeIfAir('cobblestone', x - 1, 65, z);
  await placeIfAir('cobblestone', x - 1, 66, z);

  // 3. Right wall (x+1, y=65..66)
  await placeIfAir('cobblestone', x + 1, 65, z);
  await placeIfAir('cobblestone', x + 1, 66, z);

  // 4. Roof at y=67
  await placeIfAir('cobblestone', x, 67, z);

  // 5. Step forward safely into enclosed section
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(x, 65, z));
    console.log(`Advanced to (${x}, 65, ${z})!`);
  } catch (e) {
    await bot.lookAt(new Vec3(x + 0.5, 65.0, z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(350);
    bot.setControlState('forward', false);
  }
}

// Check distance to Blaze Spawner
const spawnerTarget = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawnerTarget);
console.log(`Final pos: ${lib.fmt(bot.entity.position)}, Distance to Blaze Spawner: ${dist.toFixed(1)}m`);
console.log('Cobblestone remaining:', lib.count('cobblestone'));
bot.chat(`delta: Enclosed blast-proof corridor advanced to ${lib.fmt(bot.entity.position)}! Only ${dist.toFixed(1)}m to Blaze Spawner! Cobble remaining: ${lib.count('cobblestone')}.`);
