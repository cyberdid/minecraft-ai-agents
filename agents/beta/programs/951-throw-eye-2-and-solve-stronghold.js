console.log('=== Program 951: Throw Eye #2 and Solve Stronghold Intersection ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

const throwPos2 = bot.entity.position.clone();
console.log('Throw Point 2 Position:', lib.fmt(throwPos2));
console.log('Eyes available:', lib.count('ender_eye'), 'HP:', bot.health, 'Food:', bot.food);

// Equip Eye of Ender
const eye = bot.inventory.items().find(i => i.name === 'ender_eye');
if (!eye) {
  console.log('No ender_eye in inventory!');
  return;
}

await bot.equip(eye, 'hand');
await sleep(300);

// Look up
await bot.look(bot.entity.yaw, 0.45, true);

let eyeEntity = null;
const positions = [];

const spawnHandler = (entity) => {
  if (entity.name === 'eye_of_ender' || entity.name === 'ender_eye' || entity.type === 'object') {
    eyeEntity = entity;
  }
};
bot.on('entitySpawn', spawnHandler);

console.log('Throwing Eye of Ender #2 from Throw Point 2...');
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

let stronghold = null;

if (positions.length >= 2) {
  const pStart = positions[0].pos;
  const pEnd = positions[positions.length - 1].pos;
  const dx2 = pEnd.x - pStart.x;
  const dy2 = pEnd.y - pStart.y;
  const dz2 = pEnd.z - pStart.z;
  const angleDeg2 = (Math.atan2(dz2, dx2) * 180 / Math.PI).toFixed(1);

  console.log(`Trajectory Start 2: (${pStart.x.toFixed(2)}, ${pStart.y.toFixed(2)}, ${pStart.z.toFixed(2)})`);
  console.log(`Trajectory End 2:   (${pEnd.x.toFixed(2)}, ${pEnd.y.toFixed(2)}, ${pEnd.z.toFixed(2)})`);
  console.log(`Vector 2 (dx, dz):  (${dx2.toFixed(3)}, ${dz2.toFixed(3)}), Angle: ${angleDeg2} deg`);

  // Ray 1 constants
  const m1 = 0.7743354861950956;
  const x1 = 294.5;
  const z1 = -50.5;
  const c1 = z1 - m1 * x1; // -278.5417

  // Ray 2 constants
  const m2 = dx2 !== 0 ? dz2 / dx2 : 0;
  const x2 = throwPos2.x;
  const z2 = throwPos2.z;
  const c2 = z2 - m2 * x2;

  console.log(`\nLine 1: Z = ${m1.toFixed(5)} * X + ${c1.toFixed(2)}`);
  console.log(`Line 2: Z = ${m2.toFixed(5)} * X + ${c2.toFixed(2)}`);

  if (Math.abs(m1 - m2) > 0.005) {
    const strongX = (c2 - c1) / (m1 - m2);
    const strongZ = m1 * strongX + c1;

    console.log(`\n======================================================`);
    console.log(`  EXACT STRONGHOLD COORDINATES SOLVED:`);
    console.log(`  X = ${strongX.toFixed(1)}`);
    console.log(`  Z = ${strongZ.toFixed(1)}`);
    console.log(`======================================================\n`);

    bot.chat(`Beta: STRONGHOLD LOCATED! Coordinates: X=${strongX.toFixed(0)}, Z=${strongZ.toFixed(0)}! Distance: ${bot.entity.position.distanceTo(new Vec3(strongX, bot.entity.position.y, strongZ)).toFixed(0)}m!`);

    stronghold = {
      x: Math.round(strongX),
      z: Math.round(strongZ),
      dist: Math.round(bot.entity.position.distanceTo(new Vec3(strongX, bot.entity.position.y, strongZ))),
      rawX: strongX,
      rawZ: strongZ,
      ray1: { x1, z1, m1, c1 },
      ray2: { x2, z2, m2, c2, dx: dx2, dz: dz2, angle: angleDeg2 }
    };
  } else {
    console.log('Rays are nearly parallel, angle difference too small.');
  }
}

// Vacuum dropped eye
console.log('Vacuuming dropped Eye of Ender...');
await sleep(1500);
try {
  await lib.pickup(12.0);
} catch (e) {}

console.log('Final inventory eyes:', lib.count('ender_eye'));
return {
  throwPos2,
  stronghold,
  eyesRemaining: lib.count('ender_eye'),
  pearlsRemaining: lib.count('ender_pearl')
};
