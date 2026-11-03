// programs/665-emergency-land-and-shelter.js
console.log('=== Program 665: Emergency Land & Shelter ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// Swim up and sprint onto dry land (+x, +z)
console.log('Swimming up to dry land...');
bot.setControlState('jump', true);
bot.setControlState('forward', true);
bot.setControlState('sprint', true);
await bot.lookAt(new Vec3(188, 65, -140), true);
await sleep(3500);
bot.clearControlStates();

console.log('On land pos:', lib.fmt(bot.entity.position));

// Dig 4 dirt blocks from ground nearby for shelter material
const dirtBlocks = bot.findBlocks({
  matching: b => b.name === 'dirt' || b.name === 'grass_block',
  maxDistance: 4.5
});
console.log(`Found ${dirtBlocks.length} dirt/grass blocks nearby.`);

let dug = 0;
for (const p of dirtBlocks) {
  if (dug >= 4) break;
  // Don't dig the block directly under feet
  if (p.x === Math.floor(bot.entity.position.x) && p.z === Math.floor(bot.entity.position.z)) continue;
  try {
    const b = bot.blockAt(p);
    if (b) {
      console.log(`Digging ${b.name} at ${p}...`);
      await bot.dig(b);
      dug++;
      await sleep(150);
    }
  } catch (e) {
    console.log('Dig error:', e.message);
  }
}
await lib.pickup(4);
console.log('Dirt collected:', lib.count('dirt'), 'Inv:', JSON.stringify(lib.inv()));

// If we have dirt and night is falling, shelter!
const t = lib.time();
console.log(`Time: ${t.timeOfDay}, secondsUntilNight: ${t.secondsUntilNight}`);
if (lib.count('dirt') >= 1) {
  try {
    console.log('Calling lib.shelter()...');
    await lib.shelter();
    console.log('SHELTER SECURED!');
    bot.chat('beta: Emergency shelter secured away from river. Awaiting night skip!');
  } catch (e) {
    console.log('lib.shelter note:', e.message);
  }
}

// Wait for night to skip (up to 30s)
for (let s = 0; s < 30; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  const curTime = lib.time();
  if (curTime.phase === 'day' && curTime.timeOfDay < 2000) {
    console.log('MORNING ARRIVED! Night skipped!');
    bot.chat('beta: Morning reached! Leaving shelter to sprint back to base!');
    break;
  }
}

return {
  pos: bot.entity.position,
  health: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay,
  phase: lib.time().phase,
  inv: lib.inv()
};
