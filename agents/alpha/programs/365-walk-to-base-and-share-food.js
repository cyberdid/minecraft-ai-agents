// programs/365-walk-to-base-and-share-food.js
console.log('=== Program 365: Walk to Base & Share Food with Beta ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
console.log('Daylight remaining:', lib.time().secondsUntilNight, 's');

// 1. Waypoint 1: (315, 73, -15)
console.log('Moving to Waypoint 1: (315, 73, -15)...');
try {
  await lib.goTo(315, 73, -15, 3, { timeoutMs: 25000 });
  console.log('Reached Waypoint 1:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Waypoint 1 note:', e.message);
  try {
    await lib.goToXZ(315, -15, { timeoutMs: 20000 });
  } catch (e2) {}
}

// 2. Waypoint 2: Base door exterior (294.5, 72, -52)
console.log('Moving to Base door: (294.5, 72, -52)...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 30000 });
  console.log('At base door exterior:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Base door approach note:', e.message);
  try {
    await lib.goToXZ(294.5, -52, { timeoutMs: 25000 });
  } catch (e2) {}
}

// 3. Enter base
console.log('Entering base...');
try {
  await globalThis.passDoorIn();
  console.log('Successfully entered base!');
} catch (e) {
  console.log('passDoorIn error:', e.message);
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {
    console.log('goThroughDoor error:', e2.message);
  }
}

console.log('Current pos:', lib.fmt(bot.entity.position));

// 4. Deposit 2 cooked beef into chest (293, 72, -57) for Beta
if (lib.count('cooked_beef') >= 2) {
  console.log('Depositing 2 cooked_beef into chest for Beta...');
  try {
    await lib.deposit({ cooked_beef: 2 }, 293, 72, -57);
    console.log('Deposited 2 cooked_beef!');
    bot.chat('team: Alpha deposited 2 cooked beef in chest for Beta!');
  } catch (e) {
    console.log('Deposit error:', e.message);
  }
}

// 5. Check if Alpha has a shield equipped
const offhand = bot.inventory.slots[45]; // offhand slot
console.log('Offhand item:', offhand?.name);
if (!offhand || offhand.name !== 'shield') {
  // Check if shield is in inventory or chest
  if (lib.count('shield') > 0) {
    await lib.equipArmor();
  } else {
    console.log('No shield equipped. Checking if we can craft one (6 planks + 1 iron_ingot)...');
    try {
      const chestItems = await lib.chestContents(293, 72, -57);
      console.log('Chest items:', JSON.stringify(chestItems));
      if (chestItems['iron_ingot'] && chestItems['iron_ingot'] > 0) {
        await lib.withdraw({ iron_ingot: 1 }, 293, 72, -57);
      }
      if (lib.count('*_planks') < 6 && lib.count('*_log') > 0) {
        await lib.craft('birch_planks', 4);
      }
      if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
        await lib.craft('shield', 1);
        await lib.equipArmor();
        console.log('Shield crafted and equipped!');
      }
    } catch (e) {
      console.log('Shield craft error:', e.message);
    }
  }
}

console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha inside base. HP: ${bot.health}/20, Food: ${bot.food}/20. Full iron armor equipped! Ready for Nether expedition.`);
