// programs/489-step-in-and-sleep-now.js
console.log('=== Step: Step Inside & Sleep with Team ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

// 1. Open door and step into base interior (294, 72, -55)
try {
  const door = bot.blockAt(new Vec3(294, 72, -54));
  if (door && door.name === 'oak_door') {
    await lib.door(294, 72, -54, true);
  }
} catch (e) {}

await bot.lookAt(new Vec3(294.5, 72.5, -55.5), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.clearControlStates();

try {
  await lib.door(294, 72, -54, false);
  console.log('Door closed securely behind us!');
} catch (e) {}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 2. Find beds
const beds = bot.findBlocks({
  matching: b => b.name.endsWith('_bed'),
  maxDistance: 4,
  count: 3
});
console.log(`Found ${beds.length} bed positions`);

// 3. Sleep loop (wait for 12542 and sleep)
let slept = false;
for (let t = 0; t < 35; t++) {
  if (isCancelled()) break;
  const time = bot.time.timeOfDay;
  
  if (time >= 12542 && time <= 23460 && !bot.isSleeping) {
    for (const bp of beds) {
      try {
        const bed = bot.blockAt(bp);
        console.log(`Sleeping in bed at ${lib.fmt(bp)}...`);
        await bot.sleep(bed);
        console.log('Successfully sleeping in bed!');
        slept = true;
        break;
      } catch (e) {
        // Bed might be occupied or daytime
      }
    }
  }
  
  // Rolled over to morning
  if (time < 1000 && t > 3) {
    console.log('DAWN HAS ARRIVED! Time:', time);
    break;
  }
  
  await sleep(1000);
}

if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

console.log('Dawn reached! Time:', bot.time.timeOfDay, 'HP:', bot.health, 'Food:', bot.food);
bot.chat(`beta: Good morning team! Dawn reached at time=${bot.time.timeOfDay}. Starting stone gear crafting!`);
