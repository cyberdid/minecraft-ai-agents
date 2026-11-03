console.log('=== Program 950: March to Throw Point 2 & Compute Stronghold Coordinates ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'Eyes:', lib.count('ender_eye'));

bot.chat('Beta: Marching 160m West to (130, 64, -45) to throw Eye #2 and compute exact Stronghold intersection!');

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

// Staged waypoints West
const waypoints = [
  { x: 250, y: 68, z: -48 },
  { x: 200, y: 64, z: -42 },
  { x: 160, y: 62, z: -38 },
  { x: 130, y: 64, z: -45 }
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`Marching to Waypoint ${i + 1}/${waypoints.length} at (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
  } catch (e) {
    console.log(`WP ${i + 1} pathfinder error, trying goToXZ:`, e.message);
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 12000 });
    } catch (e2) {
      console.log(`WP ${i + 1} goToXZ error:`, e2.message);
    }
  }
}

const throwPos2 = bot.entity.position.clone();
console.log('Arrived at Throw Point 2:', lib.fmt(throwPos2));

// Equip Eye of Ender
const eye = bot.inventory.items().find(i => i.name === 'ender_eye');
if (!eye) {
  console.log('No ender_eye in inventory!');
  return;
}

await bot.equip(eye, 'hand');
await sleep(300);

// Look up
await bot.look(bot.entity.yaw, 0.4, true);

let eyeEntity = null;
const positions = [];

const spawnHandler = (entity) => {
  if (entity.name === 'eye_of_ender' || entity.name === 'ender_eye' || entity.type === 'object') {
    eyeEntity = entity;
  }
};
bot.on('entitySpawn', spawnHandler);

console.log('Throwing Eye of Ender #2...');
bot.activateItem();

const trackStart = Date.now();
while (Date.now() - trackStart < 4000) {
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

console.log(`Tracked ${positions.length} trajectory points for Eye #2!`);

let strongholdResult = null;

if (positions.length >= 2) {
  const pStart = positions[0].pos;
  const pEnd = positions[positions.length - 1].pos;
  const dx2 = pEnd.x - pStart.x;
  const dy2 = pEnd.y - pStart.y;
  const dz2 = pEnd.z - pStart.z;
  const angleDeg2 = (Math.atan2(dz2, dx2) * 180 / Math.PI).toFixed(1);

  console.log(`Ray 2 Vector: dx=${dx2.toFixed(3)}, dz=${dz2.toFixed(3)}, Angle: ${angleDeg2}°`);

  const m1 = 0.7743354861950956;
  const x1 = 294.5;
  const z1 = -50.5;
  const c1 = z1 - m1 * x1; // -278.5417

  const m2 = dx2 !== 0 ? dz2 / dx2 : 0;
  const x2 = throwPos2.x;
  const z2 = throwPos2.z;
  const c2 = z2 - m2 * x2;

  console.log(`Line 1: Z = ${m1.toFixed(4)} * X + ${c1.toFixed(2)}`);
  console.log(`Line 2: Z = ${m2.toFixed(4)} * X + ${c2.toFixed(2)}`);

  if (Math.abs(m1 - m2) > 0.005) {
    const strongX = (c2 - c1) / (m1 - m2);
    const strongZ = m1 * strongX + c1;

    console.log(`\n========================================`);
    console.log(`STRONGHOLD INTERSECTION SOLVED:`);
    console.log(`  X = ${strongX.toFixed(1)}`);
    console.log(`  Z = ${strongZ.toFixed(1)}`);
    console.log(`========================================\n`);

    bot.chat(`Beta: STRONGHOLD TRIANGULATION SOLVED! Coordinates: X=${strongX.toFixed(0)}, Z=${strongZ.toFixed(0)}!`);

    strongholdResult = {
      x: strongX,
      z: strongZ,
      ray1: { m: m1, c: c1 },
      ray2: { m: m2, c: c2, dx: dx2, dz: dz2, angle: angleDeg2 }
    };
  } else {
    console.log('Rays are nearly parallel, need a wider baseline.');
  }
}

// Vacuum dropped eye
console.log('Vacuuming dropped eye...');
await sleep(1500);
try { await lib.pickup(12.0); } catch (e) {}

console.log('Eyes remaining:', lib.count('ender_eye'));
return {
  throwPos2,
  stronghold: strongholdResult,
  eyesRemaining: lib.count('ender_eye'),
  pearlsRemaining: lib.count('ender_pearl'),
  hp: bot.health,
  food: bot.food
};
