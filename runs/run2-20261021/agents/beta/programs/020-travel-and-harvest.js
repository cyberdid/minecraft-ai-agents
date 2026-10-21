bot.chat("alpha: Navigating to grove (133, 65, -114) now for 14 logs. Will return with roof & door in ~90s.");

// Robust step-by-step navigation
async function walkTowards(tx, tz, step = 35) {
  while (!isCancelled()) {
    const cur = bot.entity.position;
    const dist = Math.hypot(tx - cur.x, tz - cur.z);
    console.log(`Current pos: ${lib.fmt(cur)}, dist to (${tx}, ${tz}): ${Math.round(dist)}`);
    if (dist <= 8) break;
    const ratio = Math.min(1, step / dist);
    const nx = Math.round(cur.x + (tx - cur.x) * ratio);
    const nz = Math.round(cur.z + (tz - cur.z) * ratio);
    console.log(`Stepping to (${nx}, ${nz})...`);
    await lib.goToXZ(nx, nz);
  }
}

console.log('Heading to tree grove at (133, -114)...');
await walkTowards(133, -114, 35);
console.log('Arrived near grove! Pos:', lib.fmt(bot.entity.position));

// Collect 14 logs
console.log('Collecting 14 oak logs...');
const gotLogs = await lib.collect('*_log', 14);
console.log('Collected logs:', JSON.stringify(gotLogs));

// Check nearby sheep for food/wool
const sheep = bot.nearestEntity(e => e.name === 'sheep' && bot.entity.position.distanceTo(e.position) < 15);
if (sheep) {
  try {
    console.log('Hunting sheep for food...');
    await bot.pathfinder.goto(new goals.GoalNear(sheep.position.x, sheep.position.y, sheep.position.z, 2));
    await lib.equipWeapon();
    bot.attack(sheep);
    await sleep(600);
    bot.attack(sheep);
    await sleep(600);
    bot.attack(sheep);
    await sleep(400);
    await lib.pickup(6);
  } catch (e) {
    console.log('Hunt note:', e.message);
  }
}

// Craft planks (at least 55)
console.log('Crafting oak planks...');
await lib.craft('oak_planks', 55);

// Craft oak door
console.log('Crafting oak door...');
await lib.craft('oak_door', 1);

console.log('Inventory prepared:', JSON.stringify(lib.inv()));

// Navigate back to base (10, -25)
console.log('Returning to base at (10, -25)...');
await walkTowards(10, -25, 35);
await lib.goTo(10, 67, -25, 2);

console.log('Arrived at base! Pos:', lib.fmt(bot.entity.position));
console.log('Inventory now:', JSON.stringify(lib.inv()));

bot.chat("alpha: I have arrived at base with " + lib.count('oak_planks') + " planks and " + lib.count('oak_door') + " doors! Ready to build.");

return lib.status();
