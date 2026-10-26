// programs/162-check-beta-diamond-progress.js
console.log('--- Checking Beta Diamond Progress ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Time:', lib.time().timeOfDay, 'Night in:', lib.time().secondsUntilNight);

// Ensure door is closed
const doorBlk = bot.blockAt(new Vec3(294, 72, -54));
if (doorBlk && doorBlk.getProperties().open) {
  await bot.activateBlock(doorBlk);
  console.log('Door closed.');
}

// Check Beta
let betaFound = false;
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p) {
    if (p.entity) {
      betaFound = true;
      console.log(`Beta is at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
    } else {
      console.log(`Beta is online (no entity in render distance)`);
    }
  }
}

bot.chat('alpha: Inside base, shield equipped, portal corners placed at (298, 72, -54). How is diamond mining going?');

// Check bed
const bed = bot.findBlocks({ matching: b => b.name.includes('bed'), maxDistance: 8 });
console.log('Bed in base:', bed.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

// If time is dusk (night in < 60s), shelter through the night
if (lib.time().secondsUntilNight < 60 || lib.time().night) {
  console.log('Night approaching/here. Sheltering in base...');
  while (!isCancelled()) {
    const cur = lib.time().timeOfDay;
    if (cur >= 23460 || cur < 1000) {
      console.log(`Dawn reached! Time: ${cur}`);
      break;
    }
    await sleep(10000);
    console.log(`Sheltered in base... Time: ${cur} (${23460 - cur} ticks left)`);
  }
}

console.log('End status: Pos:', lib.fmt(bot.entity.position), 'Time:', lib.time().timeOfDay);
