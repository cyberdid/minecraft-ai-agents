// programs/248-rest-and-recover-gear.js
console.log('=== Program 248: Rest for Health Regen & Recover Gear ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Start health:', bot.health, 'Food:', bot.food);

// 1. Stand safely and regenerate health to at least 16
for (let i = 0; i < 15; i++) {
  if (bot.health >= 18) {
    console.log(`Health regenerated to ${bot.health}/20!`);
    break;
  }
  await sleep(2000);
  console.log(`[t=${i*2}s] Health: ${bot.health}/20, Food: ${bot.food}/20`);
}

// 2. Navigate carefully down to death spot (327, 19, -32)
console.log('Heading to death spot (327, 19, -32)...');
const target = new Vec3(327, 19, -32);
try {
  await lib.goTo(target.x, target.y, target.z, 2, { dig: true, timeoutMs: 20000 });
} catch (e) {
  console.log('goTo note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 2));
  } catch (e2) {}
}

// 3. Pickup items
console.log('Picking up items around', lib.fmt(bot.entity.position));
await lib.pickup(12);
await sleep(1000);
await lib.pickup(12);

// Check if items are within 8m
const droppedItems = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 16);
console.log(`Visible item drops in 16m: ${droppedItems.length}`);
for (const it of droppedItems) {
  console.log(`  Item drop at ${lib.fmt(it.position)}`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(it.position.x, it.position.y, it.position.z, 1));
    await lib.pickup(4);
  } catch (e) {}
}

console.log('Alpha inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: Alpha at ${lib.fmt(bot.entity.position)}. Health: ${bot.health}/20. diamond_pickaxe=${lib.count('diamond_pickaxe')}, water_bucket=${lib.count('water_bucket')}.`);
