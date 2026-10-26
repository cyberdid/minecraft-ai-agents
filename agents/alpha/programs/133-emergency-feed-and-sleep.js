// programs/133-emergency-feed-and-sleep.js
console.log('--- Checking surroundings and food ---');
console.log('Position:', lib.fmt(bot.entity.position));
console.log('Status:', 'Health:', bot.health, 'Food:', bot.food);

// Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
  } else {
    console.log(`Player ${name} (no entity)`);
  }
}

// Make sure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {
  console.log('Door check error:', e.message);
}

// Check base chest
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(chest));
  
  // Find edible food in chest
  const foodItems = ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple', 'baked_potato', 'beef', 'mutton', 'porkchop', 'chicken'];
  for (const f of foodItems) {
    if (chest[f] && chest[f] > 0) {
      console.log(`Found ${chest[f]} of ${f} in chest! Withdrawing...`);
      await lib.withdraw({ [f]: Math.min(chest[f], 16) }, 293, 72, -57);
      break;
    }
  }
} catch (e) {
  console.log('Chest inspect error:', e.message);
}

// Try eating if we have food now
if (bot.food < 18) {
  try {
    await lib.eat();
    console.log('Ate food! Food now:', bot.food, 'Health:', bot.health);
  } catch (e) {
    console.log('Eat failed:', e.message);
  }
}

// Check time and sleep
const t = lib.time();
console.log('Time:', t.timeOfDay, 'canSleep:', t.canSleep);
if (t.canSleep) {
  console.log('Attempting sleep in bed...');
  try {
    bot.chat('alpha: Going to sleep in base bed to skip night.');
    await lib.sleepInBed();
    console.log('In bed!');
  } catch (e) {
    console.log('Sleep error:', e.message);
  }
}
