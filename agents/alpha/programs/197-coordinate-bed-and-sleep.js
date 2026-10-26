// programs/197-coordinate-bed-and-sleep.js
console.log('--- Coordinate Bed 2, Food, and Night Sleep ---');
console.log('Time info:', JSON.stringify(lib.time()));

// 1. Inspect base chest
const chestPos = new Vec3(293, 72, -57);
let chest = {};
try {
  chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest error:', e.message);
}

// 2. Check for food in chest
const foodItems = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'beef', 'mutton', 'porkchop', 'chicken'];
for (const f of foodItems) {
  if (chest[f] && chest[f] > 0) {
    console.log(`Withdrawing ${chest[f]} of ${f} from chest...`);
    try {
      await lib.withdraw({ [f]: Math.min(chest[f], 8) }, chestPos.x, chestPos.y, chestPos.z);
    } catch (e) {}
    break;
  }
}

// Eat if we withdrew cooked food
for (const cf of ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken']) {
  if (lib.count(cf) > 0 && bot.food < 18) {
    console.log(`Eating ${cf}...`);
    if (typeof safeEat === 'function') {
      await safeEat(cf);
    } else {
      await lib.eat();
    }
    console.log(`Food now: ${bot.food}, Health: ${bot.health}`);
  }
}

// If we have raw meat, smelt in base furnace
for (const rm of ['beef', 'mutton', 'porkchop', 'chicken']) {
  const c = lib.count(rm);
  if (c > 0) {
    console.log(`Smelting ${c} of ${rm}...`);
    try {
      const plank = Object.keys(lib.inv()).find(k => k.endsWith('_planks')) || 'birch_planks';
      await lib.smelt(rm, plank, c);
    } catch (e) {
      console.log('Smelt error:', e.message);
    }
  }
}

// 3. Check for wool in chest or inventory to craft Bed 2
const woolNames = ['white_wool', 'brown_wool', 'black_wool', 'gray_wool', 'light_gray_wool', 'sheep_wool'];
for (const w of woolNames) {
  const inChest = chest[w] || 0;
  const inInv = lib.count(w);
  if (inChest + inInv >= 3) {
    if (inInv < 3) {
      console.log(`Withdrawing ${3 - inInv} ${w} from chest...`);
      try {
        await lib.withdraw({ [w]: 3 - inInv }, chestPos.x, chestPos.y, chestPos.z);
      } catch (e) {}
    }
    if (lib.count(w) >= 3) {
      const bedName = w.replace('_wool', '_bed');
      console.log(`Crafting ${bedName}...`);
      try {
        if (lib.count('*_planks') < 3 && lib.count('*_log') > 0) {
          const log = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
          await lib.craft(log.replace('_log', '_planks'), 4);
        }
        await lib.craft(bedName, 1);
        console.log(`Placing ${bedName} at (293, 72, -56)...`);
        await lib.place(bedName, 293, 72, -56);
        console.log('Bed 2 placed successfully! Milestone 4 reached!');
        bot.chat('beta: Bed 2 crafted and placed at (293, 72, -56)! Both beds ready!');
      } catch (e) {
        console.log('Bed craft/place error:', e.message);
      }
    }
    break;
  }
}

// 4. Check Beta
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p) {
    console.log(`Beta pos: ${p.entity ? lib.fmt(p.entity.position) : 'unknown'}, held: ${p.entity?.heldItem?.name}`);
  }
}

bot.chat('beta: If you have wool in inventory, place Bed 2 at (293, 72, -56) or put wool in chest! We can sleep at tick 12542.');

// 5. Check if beds exist and sleep if night
const beds = bot.findBlocks({ matching: bl => bot.isABed(bl), maxDistance: 16 });
console.log(`Found ${beds.length} beds nearby:`, beds.map(b => lib.fmt(b)));

// Wait until tick 12542 if close to dusk
while (!isCancelled() && bot.time.timeOfDay < 12542 && bot.time.timeOfDay > 11000) {
  console.log(`Waiting for sleep time... tick ${bot.time.timeOfDay}/12542`);
  await sleep(2000);
}

if (lib.time().canSleep) {
  console.log('Time to sleep! Attempting sleepInBed...');
  bot.chat('beta: Sleeping now! Hop into bed to skip night!');
  try {
    await lib.sleepInBed();
    console.log('Woke up! Sleep successful. Time:', lib.time().phase, 'timeOfDay:', bot.time.timeOfDay);
  } catch (e) {
    console.log('sleepInBed error:', e.message);
  }
}

console.log('Finished 197. Status:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Time:', JSON.stringify(lib.time()));
