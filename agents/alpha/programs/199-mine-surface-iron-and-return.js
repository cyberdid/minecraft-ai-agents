// programs/199-mine-surface-iron-and-return.js
console.log('--- Mine Surface Iron and Return to Base ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', lib.time().secondsUntilNight);

// 1. Mine only nearby surface iron ores (|dy| <= 5)
const myY = bot.entity.position.y;
const allOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 20 });
const surfaceOres = allOres.filter(o => Math.abs(o.position.y - myY) <= 6);
console.log(`Found ${allOres.length} total iron ores, of which ${surfaceOres.length} are on surface (|dy| <= 6).`);

for (const ore of surfaceOres) {
  if (isCancelled() || lib.time().secondsUntilNight < 110) break;
  if (lib.count('raw_iron') >= 12) break;
  console.log(`Mining surface iron at ${lib.fmt(ore.position)} (dy=${(ore.position.y - myY).toFixed(0)})...`);
  try {
    await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true, timeoutMs: 15000 });
    await lib.dig(ore.position.x, ore.position.y, ore.position.z);
    await lib.pickup(4);
  } catch (e) {
    console.log(`Dig note at ${lib.fmt(ore.position)}:`, e.message);
  }
}

console.log(`Surface mining done. Raw iron: ${lib.count('raw_iron')}, Coal: ${lib.count('coal')}`);

// 2. Return to base before dusk
console.log('Returning to base at (294, 72, -52)...');
try {
  await lib.goTo(294, 72, -52, 1, { timeoutMs: 30000 });
} catch (e) {
  console.log('Return goTo warning:', e.message);
  try { await lib.goToXZ(294, -52, { timeoutMs: 25000 }); } catch (e2) {}
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
  console.log('Door enter error:', e.message);
}

// 3. Inspect base chest (Beta put wool and food here!)
const chestPos = new Vec3(293, 72, -57);
let chest = {};
try {
  chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest inspection error:', e.message);
}

// 4. Eat cooked food from chest if needed
const cookedFoods = ['cooked_mutton', 'cooked_beef', 'cooked_porkchop', 'cooked_chicken'];
for (const cf of cookedFoods) {
  if (chest[cf] && chest[cf] > 0 && bot.food < 18) {
    console.log(`Withdrawing 2 ${cf} from chest...`);
    try {
      await lib.withdraw({ [cf]: Math.min(chest[cf], 2) }, chestPos.x, chestPos.y, chestPos.z);
      if (typeof safeEat === 'function') await safeEat(cf);
      else await lib.eat();
      console.log(`Ate ${cf}! Food now: ${bot.food}, Health: ${bot.health}`);
    } catch (e) {
      console.log('Eat error:', e.message);
    }
  }
}

// 5. Check for wool to craft Bed 2
const woolKeys = Object.keys(chest).filter(k => k.endsWith('_wool'));
console.log('Wool keys in chest:', woolKeys);
for (const wk of woolKeys) {
  if (chest[wk] >= 3) {
    console.log(`Withdrawing 3 ${wk} to craft Bed 2...`);
    try {
      await lib.withdraw({ [wk]: 3 }, chestPos.x, chestPos.y, chestPos.z);
      const bedName = wk.replace('_wool', '_bed');
      
      // Ensure we have 3 planks
      if (lib.count('*_planks') < 3) {
        if (chest.oak_planks && chest.oak_planks >= 3) {
          await lib.withdraw({ oak_planks: 3 }, chestPos.x, chestPos.y, chestPos.z);
        } else if (lib.count('*_log') > 0) {
          const logName = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
          await lib.craft(logName.replace('_log', '_planks'), 4);
        }
      }
      
      console.log(`Crafting ${bedName}...`);
      await lib.craft(bedName, 1);
      console.log(`Placing ${bedName} at Bed 2 spot (293, 72, -56)...`);
      await lib.place(bedName, 293, 72, -56);
      console.log(`MILESTONE 4 REACHED: Both beds placed in base!`);
      bot.chat(`beta: Bed 2 (${bedName}) crafted and placed at (293, 72, -56)! Milestone 4 complete!`);
    } catch (e) {
      console.log('Bed 2 craft error:', e.message);
    }
    break;
  }
}

// 6. Put raw iron & coal in base furnace array to smelt
const rawIronCount = lib.count('raw_iron');
if (rawIronCount > 0) {
  console.log(`Smelting ${rawIronCount} raw_iron in base furnace...`);
  try {
    const furnBlock = bot.blockAt(new Vec3(295, 72, -55));
    if (furnBlock) {
      const furn = await bot.openFurnace(furnBlock);
      if (lib.count('coal') > 0) {
        await furn.putFuel(mcData.itemsByName.coal.id, null, Math.min(lib.count('coal'), 4));
      }
      await furn.putInput(mcData.itemsByName.raw_iron.id, null, rawIronCount);
      furn.close();
      console.log(`Loaded ${rawIronCount} raw iron and coal into furnace!`);
      bot.chat(`beta: Loaded ${rawIronCount} raw iron into furnace (295, 72, -55) to smelt.`);
    }
  } catch (e) {
    console.log('Furnace load error:', e.message);
  }
}

// 7. If night arrives and canSleep, sleep in bed
if (lib.time().canSleep) {
  console.log('Night has fallen! Calling sleepInBed...');
  bot.chat('beta: Night is here! Sleeping in bed to skip night.');
  try {
    await lib.sleepInBed();
    console.log('Woke up! Sleep completed.');
  } catch (e) {
    console.log('sleepInBed note:', e.message);
  }
}

console.log('Finished 199. Final pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Time:', JSON.stringify(lib.time()));
