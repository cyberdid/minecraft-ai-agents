// programs/171-return-to-base-and-hunt.js
console.log('--- RETURN TO BASE ACROSS DAYLIGHT & HUNT ANIMALS ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Swim onto shore (+X direction)
bot.setControlState('jump', true);
await bot.lookAt(new Vec3(210, 65, -110), true);
bot.setControlState('forward', true);
bot.setControlState('sprint', true);

const t0 = Date.now();
while (Date.now() - t0 < 8000 && !isCancelled()) {
  await sleep(250);
  const under = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  if (under && under.boundingBox === 'block' && under.name !== 'water' && bot.entity.position.y >= 62) {
    console.log(`Stepped on shore: ${under.name} at ${lib.fmt(bot.entity.position)}`);
    break;
  }
}
bot.clearControlStates();

console.log('Shore pos:', lib.fmt(bot.entity.position));

// 2. Kill any animals in sight while moving to base
await lib.equipWeapon();
for (const mob of ['cow', 'pig', 'sheep', 'chicken']) {
  const entity = bot.nearestEntity(e => e.name === mob && e.position.distanceTo(bot.entity.position) < 20);
  if (entity) {
    console.log(`Found ${mob} nearby at ${lib.fmt(entity.position)}! Attacking...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(entity.position.x, entity.position.y, entity.position.z, 2));
      for (let h = 0; h < 4 && entity.isValid; h++) {
        bot.attack(entity);
        await sleep(650);
      }
      await lib.pickup(6);
      console.log(`Gained drops from ${mob}! Inv:`, JSON.stringify(lib.inv()));
    } catch (e) {
      console.log(`Mob attack error:`, e.message);
    }
  }
}

// 3. Move via waypoints to base
const waypoints = [
  new Vec3(210, 64, -110),
  new Vec3(235, 66, -90),
  new Vec3(265, 68, -75),
  new Vec3(290, 71, -58),
  new Vec3(294, 72, -53)
];

for (let i = 0; i < waypoints.length; i++) {
  const wp = waypoints[i];
  console.log(`Moving to WP ${i + 1}: ${lib.fmt(wp)} (dist: ${bot.entity.position.distanceTo(wp).toFixed(1)}m)...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 12000 });
  } catch (e) {
    console.log(`WP ${i + 1} note: ${e.message}`);
    try {
      await lib.goToXZ(wp.x, wp.z, { timeoutMs: 10000 });
    } catch (e2) {}
  }
}

// 4. Enter base
const baseDoor = new Vec3(294, 72, -54);
console.log('Distance to base:', bot.entity.position.distanceTo(baseDoor).toFixed(1));
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('SAFELY INSIDE BASE!');
} catch (e) {
  console.log('Door passage note:', e.message);
  try { await lib.goTo(293, 72, -56, 1); } catch (e2) {}
}

try { await lib.door(294, 72, -54, false); } catch (e) {}

// 5. Smelt any raw food collected
const raw = ['beef', 'porkchop', 'mutton', 'chicken'].filter(m => lib.count(m) > 0);
for (const m of raw) {
  const n = lib.count(m);
  console.log(`Smelting ${n} ${m}...`);
  try {
    await lib.smelt(m, 'birch_planks', n);
    console.log(`Cooked ${m}!`);
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

// 6. Eat if food < 20
if (bot.food < 20) {
  try {
    await lib.eat();
    console.log('Ate food! Hunger now:', bot.food);
  } catch (e) {}
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Final HP:', bot.health, 'Food:', bot.food);

bot.chat(`gamma back at base ${lib.fmt(bot.entity.position)}! HP: ${bot.health}, Food: ${bot.food}.`);
