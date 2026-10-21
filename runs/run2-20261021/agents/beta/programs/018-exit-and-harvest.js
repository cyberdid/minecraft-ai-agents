bot.chat("alpha: Good morning! Breaking out and heading to grove (133, 65, -114) for 14 oak logs.");

const feet = bot.entity.position.floored();
console.log('Exiting shelter from feet:', lib.fmt(feet));

// Dig exit: dig head level and foot level block in direction of alpha (south: dz = 1)
const pHead = feet.offset(0, 1, 1);
const pFeet = feet.offset(0, 0, 1);
if (bot.blockAt(pHead)?.boundingBox === 'block') {
  await lib.dig(pHead.x, pHead.y, pHead.z);
}
if (bot.blockAt(pFeet)?.boundingBox === 'block') {
  await lib.dig(pFeet.x, pFeet.y, pFeet.z);
}
// Also check if block above head is blocking jump
const pRoof = feet.offset(0, 2, 0);
if (bot.blockAt(pRoof)?.name === 'dirt') {
  await lib.dig(pRoof.x, pRoof.y, pRoof.z);
}

console.log('Stepping out...');
await lib.goTo(32, 64, -44, 1);
console.log('Outside shelter at:', lib.fmt(bot.entity.position));

// Check hostiles around
const hostiles = lib.hostiles(16);
console.log('Hostiles outside:', JSON.stringify(hostiles));

// Navigate to the forest grove
console.log('Travelling to tree grove (133, 65, -114)...');
await lib.goTo(133, 65, -114, 5);
console.log('Arrived at grove! Bot at:', lib.fmt(bot.entity.position));

// Check for sheep to get wool/food
const sheep = bot.nearestEntity(e => e.name === 'sheep' && bot.entity.position.distanceTo(e.position) < 20);
if (sheep) {
  console.log('Found sheep at:', lib.fmt(sheep.position));
  try {
    await bot.pathfinder.goto(new goals.GoalNear(sheep.position.x, sheep.position.y, sheep.position.z, 2));
    await lib.equipWeapon();
    bot.attack(sheep);
    await sleep(600);
    bot.attack(sheep);
    await sleep(600);
    bot.attack(sheep);
    await sleep(500);
    await lib.pickup(5);
  } catch (se) {
    console.log('Sheep hunt note:', se.message);
  }
}

// Collect 14 logs with stone axe
console.log('Collecting 14 oak logs...');
const got = await lib.collect('*_log', 14);
console.log('Collected logs:', JSON.stringify(got));

// Craft planks (at least 55 planks)
console.log('Crafting oak planks...');
await lib.craft('oak_planks', 55);

// Craft oak door
console.log('Crafting oak door...');
await lib.craft('oak_door', 1);

console.log('Materials ready! Returning to base (10, 67, -25)...');
await lib.goTo(10, 67, -25, 2);
console.log('Back at base! Bot at:', lib.fmt(bot.entity.position));
console.log('Inventory now:', JSON.stringify(lib.inv()));

bot.chat("alpha: I'm back at base (10, 67, -25) with " + lib.count('oak_planks') + " planks and " + lib.count('oak_door') + " doors! Ready to build roof & door.");

return lib.status();
