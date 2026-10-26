// programs/075-dusk-lockdown-and-sleep.js
console.log('--- DUSK PROTOCOL & BASE LOCKDOWN ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
  console.log('Base door confirmed closed.');
} catch (e) {
  console.log('Door check note:', e.message);
}

// 2. Check nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
  }
}

// 3. Chat alert about Fortress Bridge Hazard
bot.chat('CRITICAL ALERT: Fortress bridge at (49..55, 65, -114..-120) has open drops into lava ocean at y=25! Ghasts and Blazes knock players off. We MUST build cobblestone walls/parapets along the bridge!');

// 4. Wait for sleep time (12542) if dusk
while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  await sleep(1000);
}

// 5. Sleep in bed
console.log('Sleeping in bed...');
try {
  await lib.sleepInBed();
  console.log('Slept in bed!');
} catch (e) {
  console.log('Sleep note:', e.message);
}

console.log('Time after sleep attempt:', JSON.stringify(lib.time()));
