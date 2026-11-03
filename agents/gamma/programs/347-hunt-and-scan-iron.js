// programs/347-hunt-and-scan-iron.js
console.log('--- Step 1: Scan for animals ---');
const animalNames = ['cow', 'pig', 'sheep', 'chicken'];
let targets = [];
for (const e of Object.values(bot.entities)) {
  if (e && animalNames.includes(e.name) && e.position.distanceTo(bot.entity.position) < 40) {
    targets.push(e);
  }
}
targets.sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));
console.log(`Found ${targets.length} animals nearby:`, targets.map(t => `${t.name} at ${lib.fmt(t.position)} dist ${t.position.distanceTo(bot.entity.position).toFixed(1)}`).join(', '));

// Hunt nearest 2 animals if available
for (let i = 0; i < Math.min(2, targets.length); i++) {
  if (lib.time().secondsUntilNight < 100) break;
  const target = targets[i];
  if (!target || !target.isValid) continue;
  console.log(`Hunting ${target.name}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2));
    await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');
    while (target.isValid && target.position.distanceTo(bot.entity.position) < 3.5) {
      bot.attack(target);
      await sleep(650);
    }
    await lib.pickup(6);
  } catch (err) {
    console.log(`Error hunting ${target.name}:`, err.message);
  }
}

console.log('--- Step 2: Scan for iron and coal ---');
const ores = lib.find(['iron_ore', 'deepslate_iron_ore', 'coal_ore'], { maxDistance: 48, count: 5 });
console.log('Found ores:', ores.map(o => `${o.name} at ${lib.fmt(o.position)}`).join(', '));

// If exposed iron ore is found, mine it
for (const ore of ores) {
  if (lib.time().secondsUntilNight < 90) break;
  if (ore.name.includes('iron') && ore.position.y > 60) {
    console.log(`Mining ${ore.name} at ${lib.fmt(ore.position)}...`);
    try {
      await lib.dig(ore.position.x, ore.position.y, ore.position.z);
      await lib.pickup(4);
    } catch (err) {
      console.log('Dig ore error:', err.message);
    }
  }
}

console.log('--- Step 3: Top up cobblestone to 30+ ---');
while (lib.count('cobblestone') < 30 && lib.time().secondsUntilNight > 80 && !isCancelled()) {
  try {
    await lib.collect('stone', 4);
  } catch (e) {
    console.log('Collect stone error:', e.message);
    break;
  }
}

console.log('--- Step 4: Safety check & retreat to base if dusk ---');
const time = lib.time();
console.log(`Time: ${time.timeOfDay}, night in: ${time.secondsUntilNight}s`);
if (time.secondsUntilNight < 90 || time.night) {
  console.log('Retreating to base...');
  try {
    await lib.goTo(294, 72, -53, 1, { timeoutMs: 10000 });
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    console.log('Base entry error:', e.message);
  }
}

console.log('Gamma inv now:', JSON.stringify(lib.inv()));
