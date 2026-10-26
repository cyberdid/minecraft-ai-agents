// programs/039-eat-beef-and-sleep.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Pickup nearby items (cooked beef tossed by gamma)
const picked = await lib.pickup(8);
console.log(`Picked up ${picked} items!`);

// 2. Eat best food
try {
  await lib.eat();
  console.log('Ate food! Health:', bot.health, 'Food:', bot.food);
} catch (e) {
  console.log('Eat note:', e.message);
}

// 3. Walk to base door and enter
const doorPos = new Vec3(294, 72, -54);
await bot.pathfinder.goto(new goals.GoalNear(doorPos.x, doorPos.y, doorPos.z, 2));

const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  await bot.activateBlock(door);
  await sleep(200);
}
await lib.walkTo(294, -56);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 4. Equip shield and weapons
await lib.equipArmor();
await lib.equipWeapon();

// 5. Deposit pickaxes and cobblestone in chest for Beta
const chestPos = new Vec3(293, 72, -57);
try {
  await lib.deposit({
    cobblestone: 64,
    stone_pickaxe: 2
  }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Deposited pickaxes and cobblestone in chest for Beta!');
} catch (e) {
  console.log('Deposit note:', e.message);
}

// 6. Wait for 12542 ticks to sleep in Bed 2
while (!isCancelled() && lib.time().timeOfDay < 12542 && lib.time().secondsUntilNight > 0) {
  await sleep(1000);
}

if (lib.time().canSleep) {
  console.log('Sleeping in Bed 2...');
  try {
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (err) {
    console.log('Sleep note:', err.message);
  }
}

console.log('End pos:', lib.fmt(bot.entity.position));
console.log('End health:', bot.health, 'Food:', bot.food);
bot.chat(`delta: Inside base. Health: ${bot.health}/20. Bed 2 ready!`);
