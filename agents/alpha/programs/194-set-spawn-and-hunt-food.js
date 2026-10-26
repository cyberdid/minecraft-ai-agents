// programs/194-set-spawn-and-hunt-food.js
console.log('--- Step 1: Set Spawn ---');
try {
  const spawnRes = await lib.setSpawn();
  console.log('Spawn result:', spawnRes);
} catch (e) {
  console.log('setSpawn note:', e.message);
}

console.log('Night in:', lib.time().secondsUntilNight, 's');

// Only venture out if we have at least 110 seconds before night
if (lib.time().secondsUntilNight < 110) {
  console.log('Too close to nightfall (<110s). Staying sheltered in base.');
  bot.chat('beta: Staying sheltered inside base for night. Night in ' + lib.time().secondsUntilNight + 's.');
} else {
  console.log('Stepping outside to hunt cows for food...');
  bot.chat('beta: Heading North to hunt cows for food; returning before dusk.');
  
  try {
    if (typeof passDoorOut === 'function') {
      await passDoorOut();
    } else {
      await lib.goThroughDoor(294, 72, -54);
    }
    console.log('Outside base! Pos:', lib.fmt(bot.entity.position));
    
    // Hunt up to 2 cows
    console.log('Hunting cows...');
    const huntRes = await lib.hunt('cow', 2);
    console.log('Hunt result:', JSON.stringify(huntRes));
  } catch (e) {
    console.log('Hunt note:', e.message);
  }

  // Ensure we return to base immediately
  console.log('Returning to base entrance (294, 72, -52)...');
  try {
    await lib.goTo(294, 72, -52, 1, { timeoutMs: 30000 });
  } catch (e) {
    console.log('goTo door warning:', e.message);
    try { await lib.goToXZ(294, -52); } catch (e2) {}
  }

  console.log('Entering base...');
  try {
    if (typeof passDoorIn === 'function') {
      await passDoorIn();
    } else {
      await lib.goThroughDoor(294, 72, -54);
    }
    console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Door passage error:', e.message);
  }
}

// Check what food was obtained
console.log('Inventory now:', JSON.stringify(lib.inv()));
const rawBeef = lib.count('beef');
console.log(`Raw beef count: ${rawBeef}`);

if (rawBeef > 0) {
  console.log(`Smelting ${rawBeef} beef in base furnace...`);
  try {
    // Check if we need fuel
    const furnBlock = bot.blockAt(new Vec3(295, 72, -55));
    if (furnBlock) {
      const furn = await bot.openFurnace(furnBlock);
      const fuelItem = furn.fuelItem();
      console.log('Furnace fuel:', fuelItem?.name, fuelItem?.count);
      if (!fuelItem || fuelItem.count === 0) {
        const plank = bot.inventory.items().find(i => i.name.endsWith('_planks'));
        if (plank) {
          console.log('Adding plank to furnace fuel...');
          await furn.putFuel(plank.type, null, Math.min(2, plank.count));
        }
      }
      furn.close();
    }
    
    await lib.smelt('beef', 'birch_planks', rawBeef);
    console.log('Smelting completed!');
  } catch (e) {
    console.log('Smelt error:', e.message);
  }
}

// Eat cooked beef if we have it
const cookedBeef = lib.count('cooked_beef');
if (cookedBeef > 0) {
  console.log(`Eating cooked beef (${cookedBeef} available)...`);
  for (let i = 0; i < Math.min(2, cookedBeef); i++) {
    if (typeof safeEat === 'function') {
      await safeEat('cooked_beef');
    } else {
      await lib.eat();
    }
    console.log(`Ate cooked beef. Food now: ${bot.food}, Health: ${bot.health}`);
    if (bot.food >= 18) break;
  }
} else if (rawBeef > 0 && bot.food === 0) {
  // If smelting failed and we are starving, eat 1 raw beef
  console.log('Eating raw beef for emergency sustenance...');
  if (typeof safeEat === 'function') {
    await safeEat('beef');
  } else {
    await lib.eat();
  }
  console.log(`Ate raw beef. Food now: ${bot.food}`);
}

// Deposit spare cooked food in chest for Beta
const remainingCooked = lib.count('cooked_beef');
if (remainingCooked > 0) {
  try {
    await lib.deposit({ cooked_beef: remainingCooked }, 293, 72, -57);
    bot.chat(`beta: Placed ${remainingCooked} cooked_beef in the base chest for you!`);
  } catch (e) {
    console.log('Deposit error:', e.message);
  }
}

console.log('End status: pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight, 's');
