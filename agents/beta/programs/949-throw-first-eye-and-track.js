console.log('=== Program 949: Throw First Eye of Ender & Triangulate ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);
console.log('Eyes available:', lib.count('ender_eye'));

bot.chat('Beta: Stepping outside base (294, 72, -50) to throw Eye #1 for Stronghold triangulation!');

// 1. Move outside base door to clear sky
const throwSpot = new Vec3(294, 72, -50);
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

try {
  await bot.pathfinder.goto(new goals.GoalNear(throwSpot.x, throwSpot.y, throwSpot.z, 1.0));
} catch (e) {
  try { await lib.goToXZ(throwSpot.x, throwSpot.z, { timeoutMs: 8000 }); } catch (e2) {}
}

console.log('At throw position:', lib.fmt(bot.entity.position));

// 2. Prepare Eye of Ender in hand
const eye = bot.inventory.items().find(i => i.name === 'ender_eye');
if (!eye) {
  console.log('No ender_eye in inventory!');
  return;
}

await bot.equip(eye, 'hand');
await sleep(300);

// Look up towards the sky (pitch ~ 0.5 rad up)
await bot.look(bot.entity.yaw, 0.4, true);

let eyeEntity = null;
const positions = [];

const spawnHandler = (entity) => {
  if (entity.name === 'eye_of_ender' || entity.name === 'ender_eye' || entity.type === 'object') {
    console.log(`Detected spawned entity: name=${entity.name}, type=${entity.type}, id=${entity.id} at ${lib.fmt(entity.position)}`);
    eyeEntity = entity;
  }
};

bot.on('entitySpawn', spawnHandler);

console.log('Activating Eye of Ender...');
bot.activateItem();

// Track entity trajectory over 3.5 seconds
const trackStart = Date.now();
while (Date.now() - trackStart < 4000) {
  // If we didn't catch via event, scan bot.entities
  if (!eyeEntity) {
    eyeEntity = Object.values(bot.entities).find(e =>
      e.isValid && (e.name === 'eye_of_ender' || e.name === 'ender_eye') &&
      bot.entity.position.distanceTo(e.position) <= 25
    );
  }

  if (eyeEntity) {
    positions.push({
      t: Date.now() - trackStart,
      pos: eyeEntity.position.clone()
    });
  }

  await sleep(150);
}

bot.removeListener('entitySpawn', spawnHandler);

console.log(`Tracked ${positions.length} trajectory points for Eye of Ender!`);

let ray = null;
if (positions.length >= 2) {
  const pStart = positions[0].pos;
  const pEnd = positions[positions.length - 1].pos;
  const dx = pEnd.x - pStart.x;
  const dy = pEnd.y - pStart.y;
  const dz = pEnd.z - pStart.z;
  const horizontalDist = Math.hypot(dx, dz);
  const angleDeg = (Math.atan2(dz, dx) * 180 / Math.PI).toFixed(1);

  console.log(`Trajectory Start: (${pStart.x.toFixed(2)}, ${pStart.y.toFixed(2)}, ${pStart.z.toFixed(2)})`);
  console.log(`Trajectory End:   (${pEnd.x.toFixed(2)}, ${pEnd.y.toFixed(2)}, ${pEnd.z.toFixed(2)})`);
  console.log(`Vector (dx, dz):  (${dx.toFixed(3)}, ${dz.toFixed(3)}), Angle: ${angleDeg} deg`);

  ray = {
    originX: bot.entity.position.x,
    originZ: bot.entity.position.z,
    dx,
    dz,
    angleDeg,
    slope: dx !== 0 ? dz / dx : null
  };

  bot.chat(`Beta: Eye #1 Thrown from (${bot.entity.position.x.toFixed(0)}, ${bot.entity.position.z.toFixed(0)})! Angle: ${angleDeg}°, Vector: dx=${dx.toFixed(2)}, dz=${dz.toFixed(2)}`);
} else {
  console.log('Could not track eye trajectory points. Check nearby dropped item or yaw direction.');
}

// 3. Vacuum dropped eye if it dropped back
console.log('Vacuuming dropped Eye of Ender...');
await sleep(1500);
try {
  await lib.pickup(12.0);
} catch (e) {}

// Step back near house door
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52, 1.0));
} catch (e) {}

console.log('Ender eyes remaining in inventory:', lib.count('ender_eye'));
return {
  throwPos: bot.entity.position,
  ray,
  eyesRemaining: lib.count('ender_eye'),
  pearlsRemaining: lib.count('ender_pearl')
};
