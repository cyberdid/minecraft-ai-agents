// programs/175-hunt-cod-and-cook.js
console.log('--- HUNT COD FISH AT LAKE AND COOK FOR FULL RECOVERY ---');
console.log('Current pos:', lib.fmt(bot.entity.position));
console.log('Food:', bot.food, 'HP:', bot.health);
console.log('Time:', JSON.stringify(lib.time()));

// 1. Exit base
await lib.goThroughDoor(294, 72, -54);
console.log('Outside base at:', lib.fmt(bot.entity.position));

// 2. Walk West towards lake shore at (248, 62, -52)
console.log('Moving to lake shore at (248, 62, -52)...');
try {
  await lib.goTo(248, 63, -52, 2, { timeoutMs: 15000 });
} catch (e) {
  try { await lib.goToXZ(248, -52, { timeoutMs: 10000 }); } catch (e2) {}
}

console.log('At lake shore:', lib.fmt(bot.entity.position));

// 3. Scan for cod entities in the water
await lib.equipWeapon();
let codKilled = 0;

for (let attempt = 0; attempt < 10 && codKilled < 5; attempt++) {
  const codEntities = Object.values(bot.entities)
    .filter(e => e.name === 'cod' && e.position && e.position.distanceTo(bot.entity.position) < 25)
    .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

  console.log(`Attempt ${attempt + 1}: Found ${codEntities.length} cod nearby`);
  if (codEntities.length === 0) {
    // Step slightly deeper into water or along shore
    await lib.walkTo(bot.entity.position.x - 3, bot.entity.position.z, 2000);
    continue;
  }

  const fish = codEntities[0];
  console.log(`Approaching cod at ${lib.fmt(fish.position)} (dist: ${bot.entity.position.distanceTo(fish.position).toFixed(1)}m)...`);
  
  // Swim towards fish
  bot.setControlState('jump', true);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(fish.position.x, fish.position.y, fish.position.z, 2));
  } catch (e) {}

  // Attack fish
  if (fish.isValid && bot.entity.position.distanceTo(fish.position) < 3.8) {
    await bot.lookAt(fish.position);
    bot.attack(fish);
    codKilled++;
    console.log(`Hit cod! Total killed: ${codKilled}`);
    await sleep(400);
    await lib.pickup(4);
  }
}

bot.clearControlStates();
console.log('Cod fishing finished. Inv now:', JSON.stringify(lib.inv()));

// 4. Return to base
console.log('Returning to base at (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 18000 });
} catch (e) {
  try { await lib.goToXZ(294, -53, { timeoutMs: 12000 }); } catch (e2) {}
}

try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base!');
} catch (e) {
  try { await lib.goTo(293, 72, -56, 1); } catch (e2) {}
}

try { await lib.door(294, 72, -54, false); } catch (e) {}

// 5. Smelt raw cod in base furnace
if (lib.count('cod') > 0) {
  const n = lib.count('cod');
  console.log(`Smelting ${n} raw cod in base furnace...`);
  try {
    const fuel = lib.count('birch_planks') > 0 ? 'birch_planks' : 'oak_log';
    await lib.smelt('cod', fuel, n);
    console.log(`Smelted cooked_cod! Count:`, lib.count('cooked_cod'));
  } catch (e) {
    console.log('Smelt cod error:', e.message);
  }
}

// 6. Eat until full!
while (lib.count('cooked_cod') > 0 && bot.food < 20) {
  console.log('Eating cooked_cod...');
  try {
    await lib.eat();
    console.log(`Food after eat: ${bot.food}/20`);
  } catch (e) {
    console.log('Eat note:', e.message);
    break;
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final HP:', bot.health, 'Food:', bot.food);
console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Final time:', JSON.stringify(lib.time()));

bot.chat(`gamma fed on cooked cod! HP: ${bot.health}/20, Food: ${bot.food}/20, inv has ${lib.count('cooked_cod')} spare cooked cod.`);
