// programs/075-scout-routes.js
console.log('Pos before:', lib.fmt(bot.entity.position));

// 1. Step out door to (294, 72, -52)
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
if (door && door.name.includes('door')) {
  await bot.activateBlock(door);
  await sleep(300);
  await lib.walkTo(294, -52);
  await sleep(300);
  await bot.activateBlock(bot.blockAt(doorPos));
} else {
  await lib.goTo(294, 72, -52);
}
console.log('Outside at:', lib.fmt(bot.entity.position));

// 2. Check blocks in cardinal directions
console.log('Testing South path (towards z=0):');
const southBlock = bot.blockAt(new Vec3(294, 71, -30));
console.log('Block at (294, 71, -30):', southBlock?.name);

console.log('Testing North path (towards z=-100):');
const northBlock = bot.blockAt(new Vec3(298, 71, -80));
console.log('Block at (298, 71, -80):', northBlock?.name);

// 3. Let's see if we can walk towards North waypoint (298, 72, -80)
console.log('Walking towards North waypoint (298, 72, -80)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(298, 72, -80, 2));
  console.log('Reached (298, 72, -80)! New pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('North path failed:', e.message);
}

// 4. Scan entities from current position
const animals = [];
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (!e || !e.position) continue;
  if (['cow', 'sheep', 'pig', 'chicken', 'rabbit'].includes(e.name)) {
    const d = bot.entity.position.distanceTo(e.position);
    animals.push({ name: e.name, pos: lib.fmt(e.position), dist: Math.round(d), entity: e });
  }
}
animals.sort((a,b) => a.dist - b.dist);
console.log(`Scan found ${animals.length} animals:`);
for (const a of animals) {
  console.log(`- ${a.name} at ${a.pos} (dist ${a.dist})`);
}
