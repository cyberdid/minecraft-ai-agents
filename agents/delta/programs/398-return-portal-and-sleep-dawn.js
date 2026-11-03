// programs/398-return-portal-and-sleep-dawn.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Walk to Nether portal at (40.5, 65.0, -7.0)
console.log('Stepping into Nether portal at (40.5, 65.0, -7.0)...');
try {
  await lib.goTo(40, 65, -7, 0.5, { timeoutMs: 8000 });
} catch (e) {
  await bot.lookAt(new Vec3(40.5, 65.0, -7.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

// 2. Await Overworld dimension transition
console.log('Awaiting portal transit to Overworld...');
const start = Date.now();
while (!isCancelled() && bot.game.dimension !== 'overworld' && Date.now() - start < 15000) {
  await sleep(400);
}

console.log('Dimension after portal:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));

// 3. Step inside base shelter (293, 72, -56)
console.log('Moving inside base shelter to beds...');
try {
  await lib.goTo(293, 72, -56, 1, { timeoutMs: 8000 });
} catch (e) {
  console.log('Move to base note:', e.message);
}

// 4. Locate beds and wait for night (12542) to sleep
const bedIds = Object.keys(mcData.blocksByName).filter(k => k.endsWith('_bed')).map(k => mcData.blocksByName[k].id);
const beds = bot.findBlocks({ matching: bedIds, maxDistance: 8, count: 4 });
console.log(`Found ${beds.length} beds.`);

while (!isCancelled() && (bot.time.timeOfDay < 12542 || bot.time.timeOfDay > 23460)) {
  const waitTicks = 12542 - bot.time.timeOfDay;
  if (waitTicks <= 0) break;
  if (waitTicks % 40 === 0) console.log(`Waiting for night: ${waitTicks} ticks (${(waitTicks/20).toFixed(1)}s)...`);
  await sleep(500);
}

console.log('Sleeping in bed...');
for (const bPos of beds) {
  const b = bot.blockAt(bPos);
  if (!b) continue;
  try {
    await lib.sleep(b);
    console.log(`Slept in bed at ${lib.fmt(bPos)}!`);
    break;
  } catch (e) {
    console.log(`Sleep in bed at ${lib.fmt(bPos)} error: ${e.message}`);
  }
}

console.log('Final state: pos:', lib.fmt(bot.entity.position), 'time:', bot.time.timeOfDay, 'HP:', bot.health);
