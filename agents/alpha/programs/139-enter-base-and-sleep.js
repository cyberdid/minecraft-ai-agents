// programs/139-enter-base-and-sleep.js
console.log('--- Entering Base and Sleeping ---');
console.log('Pos:', lib.fmt(bot.entity.position), '| Health:', bot.health, '| Food:', bot.food, '| Time:', lib.time().timeOfDay, '| night in:', lib.time().secondsUntilNight);

// Check door
const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
console.log('Door block at (294, 72, -54):', doorBlock?.name, 'open:', doorBlock?.getProperties()?.open);
console.log('Floor at (294, 71, -54):', bot.blockAt(new Vec3(294, 71, -54))?.name);
console.log('Floor at (294, 71, -53):', bot.blockAt(new Vec3(294, 71, -53))?.name);

// Open door and step into base
if (bot.entity.position.z > -54) {
  console.log('Outside base, entering...');
  try {
    await lib.door(294, 72, -54, true);
    await sleep(200);
  } catch (e) {
    console.log('Door open error:', e.message);
  }
  
  // Walk into base
  try {
    await lib.walkTo(293.5, -56.0, 3000);
  } catch (e) {
    console.log('walkTo inside error:', e.message);
  }
  
  // If still outside, try pathfinder or jump
  if (bot.entity.position.z > -54) {
    console.log('Still at z > -54, using pathfinder to (293, 72, -56)...');
    try {
      await lib.goTo(293, 72, -56, 1);
    } catch (e) {
      console.log('goTo inside error:', e.message);
    }
  }
  
  // Close door
  try {
    await lib.door(294, 72, -54, false);
    console.log('Door closed.');
  } catch (e) {
    console.log('Door close error:', e.message);
  }
}

console.log('Current pos:', lib.fmt(bot.entity.position));

// If we have raw mutton and fuel, cook it
if (lib.count('mutton') > 0 && (lib.count('oak_planks') > 0 || lib.count('stick') > 0)) {
  console.log('Smelting mutton in base furnace...');
  try {
    const fuel = lib.count('oak_planks') > 0 ? 'oak_planks' : 'stick';
    await lib.smelt('mutton', fuel, 1);
    console.log('Smelted mutton! Inv:', JSON.stringify(lib.inv()));
  } catch (e) {
    console.log('Smelt error:', e.message);
  }
}

// Eat if we have cooked mutton or food
if (bot.food < 18) {
  if (lib.count('cooked_mutton') > 0) {
    try {
      await safeEat('cooked_mutton');
      console.log('Ate cooked mutton! Food now:', bot.food, 'Health:', bot.health);
    } catch (e) {
      console.log('safeEat error:', e.message);
    }
  } else if (lib.count('mutton') > 0) {
    try {
      await safeEat('mutton');
      console.log('Ate raw mutton! Food now:', bot.food);
    } catch (e) {}
  }
}

// Sleep when night comes
console.log('Waiting for bedtime (canSleep)...');
bot.chat('alpha: In base with Beta. Preparing to sleep.');

const startWait = Date.now();
while (!isCancelled() && !lib.time().canSleep && (Date.now() - startWait < 60000)) {
  await sleep(1000);
}

if (lib.time().canSleep) {
  console.log('Can sleep now! Calling lib.sleepInBed()...');
  try {
    await lib.sleepInBed();
    console.log('In bed! Waiting for dawn...');
    while (!isCancelled() && lib.time().night) {
      await sleep(1000);
      const cur = lib.time();
      if (!cur.night || cur.timeOfDay < 1000 || cur.timeOfDay >= 23460) {
        console.log('Morning arrived! Time:', cur.timeOfDay);
        break;
      }
    }
  } catch (e) {
    console.log('sleepInBed error:', e.message);
  }
}

try {
  await bot.wake();
} catch (e) {}

console.log('Final pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Time:', lib.time().timeOfDay);
