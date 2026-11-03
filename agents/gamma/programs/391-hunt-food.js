// programs/391-hunt-food.js
console.log('=== HUNT FOOD & COOK AT BASE ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Scan for animals nearby
const animals = Object.values(bot.entities).filter(e => 
  (e.name === 'cow' || e.name === 'sheep' || e.name === 'pig' || e.name === 'chicken') &&
  e.position.distanceTo(bot.entity.position) < 64
).sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${animals.length} animals within 64m:`, animals.map(a => `${a.name} at ${lib.fmt(a.position)} (dist ${a.position.distanceTo(bot.entity.position).toFixed(1)})`));

let hunted = 0;
for (const a of animals.slice(0, 4)) {
  if (isCancelled()) break;
  try {
    console.log(`Hunting ${a.name} at ${lib.fmt(a.position)}...`);
    await lib.hunt(a.name, 1);
    hunted++;
  } catch (e) {
    console.log(`Hunt error for ${a.name}:`, e.message);
  }
}

console.log(`Hunted ${hunted} animals. Inv now:`, JSON.stringify(lib.inv()));

// 2. Mine 12 more cobblestone if quarry is right here
if (lib.count('cobblestone') < 30) {
  const needed = 30 - lib.count('cobblestone');
  try {
    console.log(`Mining ${needed} more stone...`);
    await lib.collect('stone', needed);
  } catch (e) {
    console.log('Collect stone note:', e.message);
  }
}

// 3. Enter base
console.log('Returning inside base...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -55));
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// 4. Smelt raw meat in base furnace at (295, 72, -55)
const rawMeats = ['beef', 'mutton', 'porkchop', 'chicken'];
for (const meat of rawMeats) {
  const c = lib.count(meat);
  if (c > 0 && (lib.count('coal') > 0 || lib.count('oak_planks') > 0)) {
    const fuel = lib.count('coal') > 0 ? 'coal' : 'oak_planks';
    console.log(`Smelting ${c} ${meat} using ${fuel}...`);
    try {
      await lib.smelt(meat, fuel, c);
      console.log(`Smelted ${meat}!`);
    } catch (e) {
      console.log(`Smelt ${meat} error:`, e.message);
    }
  }
}

await lib.equipWeapon();
console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Final status:', JSON.stringify(lib.status()));
