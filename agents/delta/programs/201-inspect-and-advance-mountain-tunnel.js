// programs/201-inspect-and-advance-mountain-tunnel.js
console.log('Delta pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Gear:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

// 1. Stand at (44, 65, -148) facing North
await bot.lookAt(new Vec3(44.5, 65.5, -150), true);

// 2. Scan corridor from z=-147 to z=-153
console.log('--- SCAN FROM z=-147 TO z=-153 ---');
for (let z = -147; z >= -153; z--) {
  let line = `z=${z}: `;
  for (let y = 67; y >= 64; y--) {
    const b = bot.blockAt(new Vec3(44, y, z));
    line += `y${y}:${b?.name || 'none'} `;
  }
  console.log(line);
}

// 3. Advance tunnel into mountain towards z=-155
// Direction: North along x=44, digging 1x2 tunnel (y=65 and y=66), ensuring floor y=64 and roof y=67
bot.chat('delta: Digging 1x2 covered mountain tunnel North towards Blaze Spawner (32, 68, -190)...');

for (let targetZ = -149; targetZ >= -155; targetZ--) {
  if (isCancelled()) break;
  console.log(`Securing tunnel step at x=44, z=${targetZ}...`);

  // Ensure solid floor at y=64
  const floorBlock = bot.blockAt(new Vec3(44, 64, targetZ));
  if (!floorBlock || floorBlock.name === 'air' || floorBlock.name === 'cave_air') {
    console.log(`Placing floor at (44, 64, ${targetZ})...`);
    const mat = lib.count('cobblestone') > 0 ? 'cobblestone' : (lib.count('netherrack') > 0 ? 'netherrack' : 'birch_planks');
    try {
      await lib.place(mat, 44, 64, targetZ);
    } catch (e) {
      console.log('Floor place error:', e.message);
    }
  }

  // Dig block at y=66 (head) if solid
  const headBlock = bot.blockAt(new Vec3(44, 66, targetZ));
  if (headBlock && headBlock.name !== 'air' && headBlock.name !== 'cave_air') {
    console.log(`Digging head block at (44, 66, ${targetZ}) [${headBlock.name}]...`);
    try {
      await lib.dig(44, 66, targetZ);
    } catch (e) {
      console.log('Dig head error:', e.message);
    }
  }

  // Dig block at y=65 (feet) if solid
  const feetBlock = bot.blockAt(new Vec3(44, 65, targetZ));
  if (feetBlock && feetBlock.name !== 'air' && feetBlock.name !== 'cave_air') {
    console.log(`Digging feet block at (44, 65, ${targetZ}) [${feetBlock.name}]...`);
    try {
      await lib.dig(44, 65, targetZ);
    } catch (e) {
      console.log('Dig feet error:', e.message);
    }
  }

  // Step forward to (44.5, 65.0, targetZ)
  console.log(`Stepping forward to z=${targetZ}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(44, 65, targetZ));
    console.log(`Now at: ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    // Direct step
    await bot.lookAt(new Vec3(44.5, 65.0, targetZ), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
    console.log(`Stepped forward, pos now: ${lib.fmt(bot.entity.position)}`);
  }
}

// 4. Report status
const distToSpawner = bot.entity.position.distanceTo(new Vec3(32, 68, -190));
console.log(`Current pos: ${lib.fmt(bot.entity.position)}, distance to spawner: ${distToSpawner.toFixed(1)}m`);
bot.chat(`delta: Mountain tunnel advanced to ${lib.fmt(bot.entity.position)}! Distance to Blaze Spawner: ${distToSpawner.toFixed(1)}m. Netherracks mined: ${lib.count('netherrack')}.`);
console.log('Inventory:', JSON.stringify(lib.inv()));
