// programs/195-enter-cook-eat.js
console.log('--- Step inside base, smelt beef, and eat ---');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Enter base through door
if (typeof passDoorIn === 'function') {
  await passDoorIn();
} else {
  await lib.goThroughDoor(294, 72, -54);
}
console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 2. Chat with Beta
bot.chat('beta: Entered base with 2 beef. Smelting now. I will share food and then we can get more food & iron on surface.');

// 3. Open furnace at (295, 72, -55) and smelt beef
const furnBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnBlock) {
  try {
    const furn = await bot.openFurnace(furnBlock);
    const fuel = furn.fuelItem();
    console.log('Furnace fuel:', fuel?.name, fuel?.count);
    if (!fuel || fuel.count === 0) {
      const plank = bot.inventory.items().find(i => i.name.endsWith('_planks'));
      if (plank) {
        console.log('Adding plank to fuel...');
        await furn.putFuel(plank.type, null, Math.min(2, plank.count));
      }
    }
    furn.close();
  } catch (e) {
    console.log('Furnace prep error:', e.message);
  }
}

try {
  console.log('Smelting 2 beef using lib.smelt...');
  await lib.smelt('beef', 'birch_planks', 2);
  console.log('Smelting complete! Cooked beef count:', lib.count('cooked_beef'));
} catch (e) {
  console.log('lib.smelt note:', e.message);
}

// 4. Eat cooked beef
const cookedCount = lib.count('cooked_beef');
if (cookedCount > 0) {
  console.log(`Eating cooked beef (${cookedCount} in inventory)...`);
  const foodItem = bot.inventory.items().find(i => i.name === 'cooked_beef');
  if (foodItem) {
    await bot.equip(foodItem, 'hand');
    bot.deactivateItem();
    bot.activateItem();
    await sleep(2500);
    bot.deactivateItem();
    console.log(`Ate cooked beef! Food: ${bot.food}, Health: ${bot.health}`);
  }
}

// 5. If we have a second cooked beef, put it in chest or toss to Beta
if (lib.count('cooked_beef') > 0) {
  try {
    console.log('Depositing 1 cooked_beef in base chest for Beta...');
    await lib.deposit({ cooked_beef: 1 }, 293, 72, -57);
    bot.chat('beta: Placed 1 cooked_beef in base chest for you!');
  } catch (e) {
    console.log('Deposit error:', e.message);
  }
}

// Report final status
console.log('Final pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight, 's');
