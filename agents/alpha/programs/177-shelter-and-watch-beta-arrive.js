// programs/177-shelter-and-watch-beta-arrive.js
console.log('--- Awaiting Beta at Base & Sheltering through Night ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', lib.time().timeOfDay, 'Night in:', lib.time().secondsUntilNight);

let betaGreeted = false;

while (!isCancelled()) {
  const cur = lib.time().timeOfDay;
  
  // Check Beta
  const beta = bot.players.beta?.entity;
  if (beta) {
    if (!betaGreeted && beta.position.y >= 70) {
      console.log(`Beta has reached base level! Pos: ${lib.fmt(beta.position)}`);
      bot.chat('beta: Welcome back! Crafting table at (295, 72, -56), sticks in chest. Craft diamond_pickaxe!');
      betaGreeted = true;
    }
  }
  
  // Dawn check
  if (cur >= 23460 || cur < 1000) {
    console.log(`Dawn reached! Time is ${cur}.`);
    break;
  }
  
  // Ensure door is closed
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d && d.getProperties().open && (!beta || beta.position.distanceTo(d.position) > 4)) {
    try {
      await bot.activateBlock(d);
    } catch {}
  }
  
  await sleep(5000);
}

console.log('Dawn has broken! Hostiles within 16:', JSON.stringify(lib.hostiles(16)));
bot.chat('alpha: Dawn has arrived! Ready for lava pool at (333, 62, -78) to get obsidian for Nether portal!');
