// programs/361-return-to-base-and-smelt-beef.js
console.log('=== Program 361: Return to Base, Smelt Beef, and Recover ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
console.log('Time until night:', lib.time().secondsUntilNight, 's');

// 1. Stage-based pathfinding back to base
console.log('Navigating towards waypoint 1: (320, 74, -10)...');
try {
  await lib.goTo(320, 74, -10, 3, { timeoutMs: 30000 });
} catch (e) {
  console.log('Waypoint 1 note:', e.message);
}

console.log('Navigating towards base door outside: (294.5, 72, -52)...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 35000 });
} catch (e) {
  console.log('Base door approach note:', e.message);
}

// 2. Enter base shelter
console.log('Entering base...');
try {
  await globalThis.passDoorIn();
  console.log('Passed through door into base!');
} catch (e) {
  console.log('passDoorIn error:', e.message);
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {
    console.log('goThroughDoor error:', e2.message);
  }
}
console.log('Now at:', lib.fmt(bot.entity.position));

// 3. Smelt beef in base furnace
if (lib.count('beef') > 0) {
  console.log(`Smelting ${lib.count('beef')} beef using coal...`);
  try {
    const res = await lib.smelt('beef', 'coal', lib.count('beef'));
    console.log('Smelt result:', JSON.stringify(res));
  } catch (e) {
    console.log('Smelt error:', e.message);
  }
}

// 4. Eat cooked beef to 20/20 food
console.log('Cooked beef count:', lib.count('cooked_beef'));
while (bot.food < 20 && lib.count('cooked_beef') > 0) {
  console.log(`Food is ${bot.food}/20. Eating cooked_beef...`);
  const ate = await globalThis.safeEat('cooked_beef');
  if (!ate) {
    console.log('safeEat returned false, trying lib.eat...');
    try {
      await lib.eat();
    } catch (e) {
      console.log('lib.eat error:', e.message);
      break;
    }
  }
  console.log(`After eating: food is ${bot.food}/20, health is ${bot.health}/20`);
}

// 5. Allow some time for health regeneration if food >= 18
if (bot.food >= 18 && bot.health < 20) {
  console.log('Regenerating health inside safe base...');
  for (let i = 0; i < 20 && bot.health < 20; i++) {
    if (isCancelled()) break;
    await sleep(2000);
    console.log(`Health: ${bot.health}/20 (food: ${bot.food}/20)`);
  }
}

bot.chat(`team: Alpha back in base with ${lib.count('cooked_beef')} cooked beef. Health: ${bot.health}/20, Food: ${bot.food}/20`);

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final status:', JSON.stringify(lib.status()));
