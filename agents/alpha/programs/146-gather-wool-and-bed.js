// programs/146-gather-wool-and-bed.js
console.log('--- Gathering Wool for Bed 2 ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight);

// Step outside base
try {
  await lib.door(294, 72, -54, true);
  await sleep(200);
  await lib.walkTo(294.5, -52.0, 3000);
  await lib.door(294, 72, -54, false);
} catch (e) {
  console.log('Door exit error:', e.message);
}

// 1. Collect 2 logs for planks if needed
if (lib.count('*_planks') < 4) {
  console.log('Collecting 2 logs for planks...');
  try {
    await lib.collect('*_log', 2);
    // craft planks from whatever log was collected
    const logItem = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
    if (logItem) {
      const plankName = logItem.replace('_log', '_planks');
      await lib.craft(plankName, 8);
    }
  } catch (e) {
    console.log('Log collect/craft note:', e.message);
  }
}

// 2. Hunt sheep until we have 3 wool of a single color
console.log('Starting sheep hunt...');
const woolColors = ['brown_wool', 'white_wool', 'black_wool', 'gray_wool'];
function has3Wool() {
  return woolColors.some(w => lib.count(w) >= 3);
}

let hunts = 0;
while (!isCancelled() && !has3Wool() && hunts < 6) {
  if (lib.time().secondsUntilNight < 180) {
    console.log('Night approaching in < 180s, aborting hunt to return home.');
    break;
  }
  console.log(`Hunting sheep (attempt ${hunts + 1})... Current wool: brown=${lib.count('brown_wool')}, white=${lib.count('white_wool')}`);
  try {
    const res = await lib.hunt('sheep', 1);
    console.log('Sheep hunt result:', JSON.stringify(res));
  } catch (e) {
    console.log('Hunt sheep error:', e.message);
    // Try exploring slightly east towards (350, -70) where sheep were seen before
    try {
      console.log('Exploring towards east...');
      await lib.goToXZ(bot.entity.position.x + 20, bot.entity.position.z - 10);
    } catch (e2) {}
  }
  hunts++;
}

console.log('Wool inventory after hunt: brown=', lib.count('brown_wool'), 'white=', lib.count('white_wool'));

// 3. Return to base
console.log('Returning to base entrance at (294, 72, -53)...');
await lib.goTo(294, 72, -53, 1);

try {
  await lib.door(294, 72, -54, true);
  await sleep(200);
  await lib.walkTo(293.5, -56.0, 3000);
  await lib.door(294, 72, -54, false);
} catch (e) {
  console.log('Door entry error:', e.message);
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 4. If we have 3 matching wool, craft and place bed
for (const wc of woolColors) {
  if (lib.count(wc) >= 3) {
    const bedName = wc.replace('_wool', '_bed');
    console.log(`Crafting ${bedName}...`);
    try {
      await lib.craft(bedName, 1);
      console.log(`Crafted ${bedName}! Placing at (293, 72, -56)...`);
      await lib.place(bedName, 293, 72, -56);
      console.log('Placed bed! Setting spawn...');
      await lib.setSpawn();
      bot.chat(`alpha: Placed ${bedName} at (293, 72, -56) and set spawn! Milestone 4 COMPLETE!`);
      break;
    } catch (e) {
      console.log(`Craft/place bed error:`, e.message);
    }
  }
}

// 5. Deposit extra items (feathers, eggs) into chest
try {
  console.log('Depositing feathers and eggs into base chest...');
  await lib.deposit({ feather: 'all', egg: 'all' }, 293, 72, -57);
} catch (e) {
  console.log('Deposit error:', e.message);
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Health:', bot.health, 'Food:', bot.food, 'Time:', lib.time().timeOfDay);
