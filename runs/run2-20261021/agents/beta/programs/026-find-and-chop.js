console.log('Bot pos:', lib.fmt(bot.entity.position));

// 1. Search for logs or leaves
let logs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 96,
  count: 10
});

console.log('Logs found within 96 blocks:', logs.length);
if (logs.length === 0) {
  // Check leaves
  const leaves = bot.findBlocks({
    matching: b => b.name.endsWith('_leaves'),
    maxDistance: 96,
    count: 10
  });
  console.log('Leaves found:', leaves.length);
  if (leaves.length > 0) {
    console.log('Moving near leaves at:', lib.fmt(leaves[0]));
    await lib.goToXZ(leaves[0].x, leaves[0].z);
  } else {
    console.log('Walking further North towards earlier trees at (137, -160)...');
    await lib.goToXZ(137, -160);
  }
} else {
  console.log('Nearest log at:', lib.fmt(logs[0]));
  await lib.goToXZ(logs[0].x, logs[0].z);
}

// 2. Collect 14 logs with stone axe
console.log('Collecting logs with stone axe...');
const got = await lib.collect('*_log', 14);
console.log('Collected logs:', JSON.stringify(got));

// 3. Check for dropped apples or animals for food
const apples = lib.count('apple');
if (apples > 0) {
  console.log('Eating apple...');
  await lib.eat();
} else {
  // Check nearest animal within 15 blocks
  const animal = bot.nearestEntity(e => ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) && bot.entity.position.distanceTo(e.position) < 15);
  if (animal) {
    console.log('Hunting', animal.name, 'for food at:', lib.fmt(animal.position));
    try {
      await bot.pathfinder.goto(new goals.GoalNear(animal.position.x, animal.position.y, animal.position.z, 2));
      await lib.equipWeapon();
      bot.attack(animal);
      await sleep(600);
      bot.attack(animal);
      await sleep(600);
      bot.attack(animal);
      await sleep(400);
      await lib.pickup(6);
      await lib.eat();
    } catch (e) {
      console.log('Hunt note:', e.message);
    }
  }
}

// 4. Craft planks for the roof
console.log('Crafting oak planks...');
await lib.craft('oak_planks', 52);
console.log('Oak planks count:', lib.count('oak_planks'));

// 5. Waypoint return to base
async function hopTo(x, z) {
  console.log(`Hopping to (${x}, ${z})...`);
  await lib.goToXZ(x, z);
}

console.log('Returning to base...');
await hopTo(85, -85);
await hopTo(45, -55);
await lib.goTo(10, 67, -25, 2);

console.log('Safely back at base! Bot at:', lib.fmt(bot.entity.position));
console.log('Planks in inventory:', lib.count('oak_planks'));
console.log('Time until night:', Math.round(lib.time().secondsUntilNight), 's');

bot.chat("alpha: I have returned to base with " + lib.count('oak_planks') + " oak planks! Building roof now.");
return lib.status();
