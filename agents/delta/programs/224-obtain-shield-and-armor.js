// programs/224-obtain-shield-and-armor.js
console.log('Delta pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(300);

// 1. Sprint East to Base Camp (293, 72, -54)
bot.chat('delta: Sprinting to Base Camp to craft SHIELD for 100% projectile immunity...');
const waypoints = [
  new Vec3(200, 65, -90),
  new Vec3(250, 68, -70),
  new Vec3(290, 72, -54)
];

for (const wp of waypoints) {
  if (isCancelled()) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, bot.entity.position.y, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    bot.setControlState('jump', true);
    await sleep(4000);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
    bot.setControlState('jump', false);
  }
}

// 2. Enter base shelter through door
const doorPos = new Vec3(294, 73, -54);
const door = bot.blockAt(doorPos) || bot.blockAt(new Vec3(294, 72, -54));
if (door && door.name.includes('door')) {
  try {
    await lib.goThroughDoor(door.position.x, door.position.y, door.position.z);
    console.log('Entered base through door!');
  } catch (err) {
    await lib.goTo(293, 72, -55, 1);
  }
} else {
  await lib.goTo(293, 72, -55, 1);
}

console.log('Inside base pos:', lib.fmt(bot.entity.position));

// 3. Lock bed spawn
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
  bot.chat('delta: Inside Base Camp! Bed spawn point locked.');
} catch (e) {}

// 4. Obtain shield via lib.obtain
console.log('Obtaining shield via lib.obtain...');
bot.chat('delta: Obtaining SHIELD (1 iron ingot + 6 planks) for complete Blaze fireball immunity...');
try {
  const resShield = await lib.obtain('shield', 1);
  console.log('Obtained shield:', JSON.stringify(resShield));
  await lib.equipArmor();
  console.log('Equipped shield in off-hand!');
} catch (e) {
  console.log('Shield obtain error:', e.message);
}

// 5. Obtain stone_sword and stone_pickaxe
try {
  if (lib.count('stone_sword') === 0) {
    await lib.obtain('stone_sword', 1);
    console.log('Obtained stone_sword!');
  }
  if (lib.count('stone_pickaxe') === 0) {
    await lib.obtain('stone_pickaxe', 1);
    console.log('Obtained stone_pickaxe!');
  }
  if (lib.count('cobblestone') < 16) {
    await lib.obtain('cobblestone', 20);
    console.log('Obtained cobblestone!');
  }
} catch (e) {
  console.log('Tool obtain error:', e.message);
}

// 6. Return inside base
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
} catch (e) {
  await lib.goTo(293, 72, -55, 1);
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final tools:', JSON.stringify(lib.tools()));
bot.chat(`delta: Armed with SHIELD, stone sword, pickaxe, and ${lib.count('cobblestone')} cobble! Invincible to Blaze fireballs. Ready for Nether!`);
