// programs/151-dawn-prep-and-fill-bucket.js
console.log('--- Dawn Prep: Food and Water Bucket ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight);

// Safe eat helper
async function safeEatFood(name) {
  const item = bot.inventory.items().find(i => i.name === name);
  if (!item) return false;
  await bot.equip(item, 'hand');
  bot.deactivateItem();
  bot.activateItem();
  const startFood = bot.food;
  const startCount = bot.inventory.count(item.type);
  for (let i = 0; i < 40; i++) {
    await sleep(100);
    if (bot.food > startFood || bot.inventory.count(item.type) < startCount) {
      bot.deactivateItem();
      return true;
    }
  }
  bot.deactivateItem();
  return false;
}

// 1. Check chest for food
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(chest));
  const edible = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread', 'apple'];
  for (const ed of edible) {
    if (chest[ed] && chest[ed] > 0) {
      console.log(`Withdrawing ${chest[ed]} of ${ed} from chest...`);
      await lib.withdraw({ [ed]: Math.min(chest[ed], 8) }, 293, 72, -57);
      break;
    }
  }
} catch (e) {
  console.log('Chest check error:', e.message);
}

// Eat if we got food
const allFoods = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread', 'apple'];
for (const f of allFoods) {
  while (bot.food < 20 && lib.count(f) > 0) {
    console.log(`Eating ${f}...`);
    await safeEatFood(f);
  }
}

// 2. If food still < 18, hunt 1 animal outside
if (bot.food < 18) {
  console.log('Hunting 1 animal outside for food...');
  try {
    await lib.door(294, 72, -54, true);
    await sleep(200);
    await lib.walkTo(294.5, -52.0, 3000);
    await lib.door(294, 72, -54, false);
    
    // Hunt chicken or cow
    try {
      await lib.hunt('chicken', 1);
    } catch {
      await lib.hunt('cow', 1);
    }
    
    // Return to base
    await lib.goTo(294, 72, -53, 1);
    await lib.door(294, 72, -54, true);
    await sleep(200);
    await lib.walkTo(293.5, -56.0, 3000);
    await lib.door(294, 72, -54, false);
    
    // Smelt and eat
    const rawMeats = ['chicken', 'beef', 'mutton', 'porkchop'];
    for (const rm of rawMeats) {
      if (lib.count(rm) > 0) {
        await lib.smelt(rm, 'birch_planks', lib.count(rm));
        await safeEatFood('cooked_' + rm);
      }
    }
  } catch (e) {
    console.log('Hunt note:', e.message);
  }
}

console.log('Food now:', bot.food, 'Health:', bot.health);

// 3. Fill Bucket with Water
if (lib.count('bucket') > 0 && lib.count('water_bucket') === 0) {
  console.log('Filling bucket with water...');
  // Check if we need to step outside
  if (bot.entity.position.z < -54) {
    try {
      await lib.door(294, 72, -54, true);
      await sleep(200);
      await lib.walkTo(294.5, -52.0, 3000);
      await lib.door(294, 72, -54, false);
    } catch (e) {}
  }
  
  try {
    const res = await lib.fillBucket('water');
    console.log('fillBucket result:', res);
  } catch (e) {
    console.log('fillBucket error:', e.message);
    // Find nearest water block manually
    const w = bot.findBlock({ matching: b => b.name === 'water' && b.metadata === 0, maxDistance: 64 });
    if (w) {
      console.log('Found water block at:', lib.fmt(w.position));
      try {
        await lib.goTo(w.position.x, w.position.y + 1, w.position.z, 2);
        await bot.equip(mcData.itemsByName.bucket.id, 'hand');
        await bot.lookAt(w.position.offset(0.5, 0.8, 0.5));
        bot.activateItem();
        await sleep(500);
      } catch (e2) {
        console.log('Manual fill error:', e2.message);
      }
    }
  }
  
  // Return to base entrance
  console.log('Returning to base...');
  try {
    await lib.goTo(294, 72, -53, 1);
    await lib.door(294, 72, -54, true);
    await sleep(200);
    await lib.walkTo(293.5, -56.0, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e) {}
}

console.log('Inventory:', JSON.stringify(lib.inv()));
bot.chat(`alpha: Water bucket status: ${lib.count('water_bucket') > 0 ? 'HAVE water_bucket' : 'need water'}. Health: ${bot.health}/20, Food: ${bot.food}/20.`);
