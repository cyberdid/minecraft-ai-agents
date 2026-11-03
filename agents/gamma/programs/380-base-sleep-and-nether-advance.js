// programs/380-base-sleep-and-nether-advance.js
console.log('=== BASE SLEEP & NETHER SQUAD ADVANCE ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', lib.time().timeOfDay, 'Night in:', lib.time().secondsUntilNight);

// Step 1: Check chest
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(contents));
  const useful = ['cooked_porkchop', 'cooked_beef', 'bread', 'iron_ingot', 'shield', 'cobblestone'];
  for (const item of useful) {
    if (contents && contents[item] > 0) {
      await lib.withdraw({ [item]: 'all' }, 293, 72, -57);
      console.log(`Withdrew ${item} x${contents[item]}`);
    }
  }
} catch (e) {}

bot.chat('gamma: armed with 2 stone swords & cobble, ready to sleep with Beta');

// Step 2: Sleep in bed when night falls
const bedBlock = bot.blockAt(new Vec3(294, 72, -55)) || bot.blockAt(new Vec3(293, 72, -55));
for (let wait = 0; wait < 60; wait++) {
  const t = lib.time();
  if (t.canSleep || t.timeOfDay >= 12542) {
    console.log(`Night arrived (${t.timeOfDay})! Sleeping in bed...`);
    try {
      await lib.sleepInBed();
      console.log('Sleeping...');
      await sleep(6000);
      break;
    } catch (e) {
      if (bedBlock) {
        try {
          await bot.activateBlock(bedBlock);
          await sleep(6000);
          break;
        } catch (e2) {}
      }
    }
  }
  await sleep(1000);
}

// Step 3: Confirm dawn
for (let wait = 0; wait < 20; wait++) {
  const t = lib.time();
  if (t.timeOfDay < 12000 || t.timeOfDay >= 23460) {
    console.log('Dawn reached! Time:', t.timeOfDay);
    break;
  }
  await sleep(2000);
}

// Step 4: Step outside to Nether portal
console.log('Stepping outside to Nether portal at (298, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -52.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 8,
  count: 5
});

if (portals.length > 0) {
  const p = portals[0];
  console.log(`Stepping into nether_portal block at ${lib.fmt(p)}...`);
  bot.setControlState('jump', true);
  try {
    await lib.goTo(p.x + 0.5, p.y, p.z + 0.5, 0.5, { dig: false, timeoutMs: 8000 });
  } catch (e) {}
  bot.clearControlStates();

  console.log('Waiting for dimension switch...');
  const t0 = Date.now();
  while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 18000)) {
    await sleep(500);
  }
}

if (String(bot.game.dimension).includes('nether')) {
  console.log('Successfully in the Nether! Pos:', lib.fmt(bot.entity.position));
  bot.chat('gamma: arrived in Nether! Fast-marching to Spawner Pillbox to reinforce Alpha & Beta!');

  // Step out of portal frame
  try { await lib.walkTo(40.5, -8.5, 2000); } catch (e) {}
  bot.clearControlStates();

  if (typeof configureFireAvoidance === 'function') {
    configureFireAvoidance();
  }
}

console.log('Final status:', JSON.stringify(lib.status()));
