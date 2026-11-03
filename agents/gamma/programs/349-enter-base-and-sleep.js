// programs/349-enter-base-and-sleep.js
console.log('--- Step 1: Return to base immediately ---');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo door step warning:', e.message);
}

try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Stepped through door!');
} catch (e) {
  console.log('goThroughDoor error, trying manual door:', e.message);
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {
    console.log('Manual door error:', e2.message);
  }
}

console.log('Gamma position inside:', lib.fmt(bot.entity.position));

// Check chest for food or items
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Chest contents:', JSON.stringify(contents));
  // If bread or food in chest, withdraw
  for (const foodItem of ['bread', 'cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'apple']) {
    if (contents && contents[foodItem] > 0) {
      console.log(`Withdrawing ${foodItem} from chest...`);
      await lib.withdraw({ [foodItem]: 'all' }, 293, 72, -57);
      await lib.eat();
    }
  }
} catch (e) {
  console.log('Chest error:', e.message);
}

console.log('--- Step 2: Night protocol & sleeping ---');
bot.chat('gamma: inside base, ready to sleep at dusk');

// Check time loop until canSleep or morning
const start = Date.now();
while (Date.now() - start < 180000 && !isCancelled()) {
  const t = lib.time();
  if (t.canSleep) {
    console.log('Can sleep now! Attempting sleepInBed...');
    try {
      await lib.sleepInBed();
      console.log('Sleeping in bed...');
      await sleep(5000);
    } catch (e) {
      console.log('sleepInBed message:', e.message);
      // Try right clicking bed at (294, 72, -55)
      const bedBlock = bot.blockAt(new Vec3(294, 72, -55)) || bot.blockAt(new Vec3(293, 72, -55));
      if (bedBlock) {
        try {
          await bot.activateBlock(bedBlock);
          await sleep(5000);
        } catch (e2) {}
      }
    }
  }
  const tAfter = lib.time();
  if (tAfter.timeOfDay < 12000 || tAfter.timeOfDay > 23460) {
    console.log('Morning reached! Time:', tAfter.timeOfDay);
    break;
  }
  await sleep(3000);
}

console.log('Status after night:', JSON.stringify(lib.status()));
