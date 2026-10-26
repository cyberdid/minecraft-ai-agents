// programs/288-sleep-night-and-prepare-morning.js
console.log('=== Step 45: Sleep night and prepare for morning obsidian mining ===');

// 1. Eat to full
await lib.eat();
console.log(`Food now: ${bot.food}/20, Health: ${bot.health}/20`);

// 2. Ensure door closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// 3. Check Alpha position
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log(`Alpha at: ${lib.fmt(alpha.position)}, dist: ${alpha.position.distanceTo(bot.entity.position).toFixed(1)}`);
}

// 4. Wait for bedtime (tick 12542) and sleep
console.log('Waiting for sleep tick 12542...');
const deadline = Date.now() + 50000;
let slept = false;

while (Date.now() < deadline && !isCancelled()) {
  const t = lib.time();
  if (t.canSleep && !slept) {
    console.log(`Bedtime reached (${t.timeOfDay}). Sleeping...`);
    try {
      await lib.sleepInBed();
      console.log('Slept in bed!');
      slept = true;
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
  await sleep(1500);
  if (slept && lib.time().phase === 'day') {
    console.log('Daybreak!');
    break;
  }
}

console.log('Beta pos:', lib.fmt(bot.entity.position));
console.log('Beta inventory:', JSON.stringify(lib.inv()));
console.log('Beta tools:', JSON.stringify(lib.tools()));
console.log('Time status:', lib.time());

bot.chat('alpha: Daybreak! I hold diamond_pickaxe, water_bucket, and flint_and_steel. Heading south to (286, 18, 8) to get 10 obsidian!');
