// programs/244-hunt-food-and-chop-wood.js
console.log('=== Step 2: Exit base, chop logs, hunt for food and wool ===');

// 1. Exit base
console.log('Exiting base through door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor note:', e.message);
  await lib.goTo(294, 72, -52, 1);
}

// 2. Collect 8 logs
console.log('Collecting logs...');
try {
  const gotLogs = await lib.collect('*_log', 8);
  console.log('Collected logs:', JSON.stringify(gotLogs));
} catch (e) {
  console.log('Collect logs note:', e.message);
}

// Craft some planks and sticks if we have logs
if (lib.count('*_log') > 0) {
  const logType = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
  const plankType = logType.replace('_log', '_planks');
  await lib.craft(plankType, 16);
  await lib.craft('stick', 8);
  if (lib.count('stone_axe') === 0 && lib.count('cobblestone') >= 3) {
    await lib.craft('stone_axe', 1);
  }
}

// 3. Scan for sheep or cows
console.log('Searching for animals for food and bed wool...');
const sheep = Object.values(bot.entities).filter(e => e && e.name === 'sheep' && e.position && e.position.distanceTo(bot.entity.position) < 48);
const cows = Object.values(bot.entities).filter(e => e && e.name === 'cow' && e.position && e.position.distanceTo(bot.entity.position) < 48);
console.log(`Nearby entities: ${sheep.length} sheep, ${cows.length} cows`);

if (sheep.length > 0) {
  try {
    console.log('Hunting sheep...');
    await lib.hunt('sheep', Math.min(3, sheep.length));
  } catch (e) {
    console.log('Hunt sheep note:', e.message);
  }
}

if (lib.count('*_wool') < 3 && cows.length > 0) {
  try {
    console.log('Hunting cows...');
    await lib.hunt('cow', Math.min(3, cows.length));
  } catch (e) {
    console.log('Hunt cow note:', e.message);
  }
}

// 4. Return to base
console.log('Returning to base...');
await lib.goTo(294, 72, -53, 1);
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door return note:', e.message);
}

console.log('Beta inv after run:', JSON.stringify(lib.inv()));
console.log('Time until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Back at base. Food: ${JSON.stringify(lib.inv())}, night in ${lib.time().secondsUntilNight}s`);
