// programs/172-cow-pasture-run.js
console.log('--- COW PASTURE RUN FOR FOOD ---');
console.log('Current pos:', lib.fmt(bot.entity.position));
console.log('Food:', bot.food, 'HP:', bot.health);
console.log('Time:', JSON.stringify(lib.time()));

// 1. Exit base
try {
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  await lib.walkTo(294.5, -52.5);
}

// 2. Run to cow pasture at (317, 71, 85) via stage 1 (305, 65, 30)
console.log('Running to Stage 1 (305, 65, 30)...');
try {
  await lib.goTo(305, 65, 30, 3, { timeoutMs: 25000 });
} catch (e) {
  console.log('Stage 1 note:', e.message);
  try { await lib.goToXZ(305, 30, { timeoutMs: 15000 }); } catch (e2) {}
}

console.log('Running to Stage 2 (317, 71, 85)...');
try {
  await lib.goTo(317, 71, 85, 3, { timeoutMs: 25000 });
} catch (e) {
  console.log('Stage 2 note:', e.message);
  try { await lib.goToXZ(317, 85, { timeoutMs: 15000 }); } catch (e2) {}
}

console.log('Arrived at cow pasture area! Pos:', lib.fmt(bot.entity.position));

// 3. Hunt cows
await lib.equipWeapon();
const cows = Object.values(bot.entities)
  .filter(e => e.name === 'cow' && e.position && e.position.distanceTo(bot.entity.position) < 48)
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${cows.length} cows nearby`);
for (const cow of cows.slice(0, 4)) {
  if (lib.time().secondsUntilNight < 180 || isCancelled()) break;
  console.log(`Hunting cow at ${lib.fmt(cow.position)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(cow.position.x, cow.position.y, cow.position.z, 2));
    const cid = cow.id;
    const deadline = Date.now() + 8000;
    while (bot.entities[cid] && Date.now() < deadline && !isCancelled()) {
      await bot.lookAt(cow.position.offset(0, cow.height * 0.5, 0));
      bot.attack(cow);
      await sleep(650);
    }
    await sleep(200);
    await lib.pickup(6);
  } catch (e) {
    console.log('Cow hunt error:', e.message);
  }
}

// Also check for sheep or pigs if fewer than 2 beef
if (lib.count('beef') < 2) {
  console.log('Checking for sheep or pigs nearby...');
  const animals = Object.values(bot.entities).filter(e => ['sheep', 'pig'].includes(e.name) && e.position.distanceTo(bot.entity.position) < 32);
  for (const an of animals.slice(0, 3)) {
    if (lib.time().secondsUntilNight < 180 || isCancelled()) break;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(an.position.x, an.position.y, an.position.z, 2));
      for (let h = 0; h < 4 && an.isValid; h++) {
        bot.attack(an);
        await sleep(650);
      }
      await sleep(200);
      await lib.pickup(6);
    } catch (e) {}
  }
}

console.log('Inventory after hunt:', JSON.stringify(lib.inv()));

// 4. Return to base before night
console.log('Returning to base at (294, 72, -53)...');
try {
  await lib.goTo(305, 65, 30, 3, { timeoutMs: 20000 });
} catch (e) {
  try { await lib.goToXZ(305, 30, { timeoutMs: 15000 }); } catch (e2) {}
}

try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 20000 });
} catch (e) {
  try { await lib.goToXZ(294, -53, { timeoutMs: 15000 }); } catch (e2) {}
}

// Enter base
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(293, 72, -56, 1); } catch (e2) {}
}

try { await lib.door(294, 72, -54, false); } catch (e) {}
console.log('Safely inside base at:', lib.fmt(bot.entity.position));

// 5. Smelt raw beef/porkchop/mutton at base furnace (295, 72, -55)
const raw = ['beef', 'porkchop', 'mutton', 'chicken'].filter(m => lib.count(m) > 0);
for (const m of raw) {
  const count = lib.count(m);
  console.log(`Smelting ${count} ${m}...`);
  try {
    const fuel = lib.count('birch_planks') > 0 ? 'birch_planks' : 'oak_log';
    await lib.smelt(m, fuel, count);
    console.log(`Cooked ${m}! Count:`, lib.count(`cooked_${m}`));
  } catch (e) {
    console.log(`Smelt ${m} error:`, e.message);
  }
}

// 6. Eat until full!
if (bot.food < 20) {
  console.log('Eating cooked food...');
  try {
    await lib.eat();
    console.log('Food after eating:', bot.food);
    if (bot.food < 20) {
      await lib.eat();
      console.log('Food after second piece:', bot.food);
    }
  } catch (e) {
    console.log('Eat error:', e.message);
  }
}

console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Final health:', bot.health, 'Food:', bot.food);

bot.chat(`gamma fed! Food: ${bot.food}/20, HP: ${bot.health}/20, Cooked food in inv: ${lib.count('cooked_*')}. Ready for Nether expedition!`);
