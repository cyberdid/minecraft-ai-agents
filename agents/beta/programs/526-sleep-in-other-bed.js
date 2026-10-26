// programs/526-sleep-in-other-bed.js
console.log('=== Step: Sleep in Unoccupied Bed to Skip Night ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'HP:', bot.health);

const beds = bot.findBlocks({ matching: b => b.name.includes('bed'), maxDistance: 6, count: 5 });
console.log(`Found ${beds.length} beds:`, beds.map(p => lib.fmt(p)));

let slept = false;
for (const bp of beds) {
  const bBlock = bot.blockAt(bp);
  console.log(`Trying bed at ${lib.fmt(bp)}...`);
  try {
    await bot.sleep(bBlock);
    console.log(`SUCCESS: Sleeping in bed at ${lib.fmt(bp)}!`);
    slept = true;
    break;
  } catch (e) {
    console.log(`Bed at ${lib.fmt(bp)} failed:`, e.message);
  }
}

if (slept) {
  console.log('Waiting for dawn...');
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    console.log(`Sleeping tick: timeOfDay=${bot.time.timeOfDay}, isSleeping=${bot.isSleeping}`);
    if (bot.time.timeOfDay < 1000 || bot.time.timeOfDay >= 23458) {
      console.log('Dawn reached!');
      break;
    }
  }
}

if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

console.log('After sleep check: timeOfDay =', bot.time.timeOfDay);
bot.chat(`beta: Awake in base! Time: ${bot.time.timeOfDay}`);

return {
  timeOfDay: bot.time.timeOfDay,
  pos: bot.entity.position
};
