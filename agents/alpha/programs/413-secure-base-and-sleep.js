// programs/413-secure-base-and-sleep.js
console.log('=== Program 413: Secure Base Shelter & Coordinate Team Sleep ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Inspect base enclosure: check walls and doorway
console.log('Inspecting base perimeter...');
const baseBlocks = [
  new Vec3(294, 72, -54), // door
  new Vec3(294, 73, -54), // door top
  new Vec3(293, 72, -54), // west wall
  new Vec3(293, 73, -54),
  new Vec3(295, 72, -54), // east wall
  new Vec3(295, 73, -54)
];

for (const p of baseBlocks) {
  const b = bot.blockAt(p);
  console.log(`Block at ${lib.fmt(p)}: ${b?.name}`);
}

// 2. Chat with Beta and Gamma
bot.chat('team: Alpha is inside base at Bed 1 (food 4/20). Sunset approaching! Beta & Gamma, let us all sleep in base beds at 12542 to skip night safely.');

// 3. Check teammates in base
for (const name of ['beta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name}: pos=${lib.fmt(p.entity.position)}`);
  } else {
    console.log(`Teammate ${name}: not in visual range`);
  }
}

// 4. Stand near Bed 1 (294, 72, -55) and wait for sleep time (12542)
console.log('Moving near Bed 1 at (294, 72, -55)...');
try {
  await lib.goNearBlock(294, 72, -55);
} catch (e) {
  console.log('goNearBlock note:', e.message);
}

console.log('Waiting for sleep time (12542)... Current time:', lib.time().timeOfDay);
while (lib.time().timeOfDay < 12542 && !isCancelled()) {
  await sleep(1000);
}

// 5. Sleep in bed
if (!isCancelled() && lib.time().canSleep) {
  console.log('Sleep time reached! Calling lib.sleepInBed()...');
  bot.chat('team: Alpha getting in bed now to skip night.');
  try {
    const res = await lib.sleepInBed();
    console.log('sleepInBed:', res);
    // Wait while sleeping until morning or wake
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      if (!bot.isSleeping) break;
    }
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

console.log('Current time after sleep cycle:', lib.time().timeOfDay, lib.time().phase);
bot.chat(`team: Alpha awake! Time=${lib.time().timeOfDay} (${lib.time().phase}), HP=${bot.health}, Food=${bot.food}.`);

console.log('Final Alpha status:', JSON.stringify(lib.status()));
