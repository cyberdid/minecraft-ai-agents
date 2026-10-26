// programs/241-emergency-climb-to-base-and-eat.js
console.log('=== Program 241: Emergency Climb to Base & Request Food ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Time:', lib.time());

// 1. Move/tower up to base entrance (294, 72, -52)
console.log('Climbing up to base entrance...');
try {
  await lib.goTo(294, 72, -52, 2, { dig: true, timeoutMs: 30000 });
  console.log('At base entrance! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Climb note:', e.message);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52, 2));
  } catch (e2) {}
}

// 2. Step inside base and close door
console.log('Entering base...');
try {
  if (typeof passDoorIn === 'function') await passDoorIn();
  else await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door entry note:', e.message);
}

try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 3. Ask Beta for food toss
bot.chat('beta: Inside base! I have diamond_pickaxe and water_bucket ready! My food is 1, please toss 2-3 food so health regenerates!');

// Wait for toss and pickup
await sleep(3000);
await lib.pickup(6);

// Eat any food
for (const food of ['cooked_porkchop', 'cooked_beef', 'cooked_mutton', 'bread', 'apple']) {
  if (lib.count(food) > 0) {
    console.log(`Eating ${food}...`);
    try {
      if (typeof safeEat === 'function') await safeEat(food);
      else await lib.eat();
    } catch (e) {}
  }
}

// 4. Try sleeping if canSleep
if (lib.time().canSleep) {
  console.log('Attempting sleep in Bed 1...');
  await lib.sleepInBed().catch(e => console.log('Sleep note:', e.message));
}

console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat(`beta: Alpha status inside base: Health ${bot.health}/20, Food ${bot.food}/20. diamond_pickaxe=${lib.count('diamond_pickaxe')}, water_bucket=${lib.count('water_bucket')}.`);
