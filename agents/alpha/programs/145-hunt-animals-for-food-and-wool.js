// programs/145-hunt-animals-for-food-and-wool.js
console.log('--- Hunting Animals for Food and Wool ---');
console.log('Starting pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

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

// 1. Step outside base
console.log('Opening door and stepping out...');
try {
  await lib.door(294, 72, -54, true);
  await sleep(200);
  await lib.walkTo(294.5, -52.0, 3000);
  await lib.door(294, 72, -54, false);
} catch (e) {
  console.log('Door passage error:', e.message);
}

console.log('Outside base at:', lib.fmt(bot.entity.position));

// 2. Scan for animals
const animals = ['sheep', 'cow', 'pig', 'chicken'];
let hunted = 0;

for (let attempt = 0; attempt < 4; attempt++) {
  if (lib.time().secondsUntilNight < 180) {
    console.log('Approaching dusk, heading back to base...');
    break;
  }
  
  // Find nearest animal
  let nearestMob = null;
  let nearestDist = 999;
  for (const e of Object.values(bot.entities)) {
    if (e && animals.includes(e.name) && e.position) {
      const d = bot.entity.position.distanceTo(e.position);
      // Prefer sheep if available
      const priority = e.name === 'sheep' ? 0.7 : 1.0;
      if (d * priority < nearestDist) {
        nearestDist = d * priority;
        nearestMob = e.name;
      }
    }
  }
  
  if (!nearestMob) {
    console.log('No animals visible nearby in entities list, trying lib.hunt(sheep)...');
    nearestMob = 'sheep';
  }
  
  console.log(`Hunting ${nearestMob}...`);
  try {
    const res = await lib.hunt(nearestMob, 1);
    console.log(`Hunt result:`, JSON.stringify(res));
    hunted++;
  } catch (e) {
    console.log(`Hunt ${nearestMob} error:`, e.message);
    if (nearestMob === 'sheep') {
      try {
        console.log('Trying cow instead...');
        const r2 = await lib.hunt('cow', 1);
        console.log('Cow hunt result:', JSON.stringify(r2));
        hunted++;
      } catch (e2) {
        console.log('Cow hunt error:', e2.message);
      }
    }
  }
  
  // If we already have 4+ raw meat and total wool >= 3, we can head back
  const rawMeatCount = lib.count('beef') + lib.count('mutton') + lib.count('porkchop') + lib.count('chicken');
  const woolCount = Math.max(lib.count('white_wool'), lib.count('brown_wool'));
  if (rawMeatCount >= 4 && (woolCount >= 3 || hunted >= 3)) {
    console.log(`Sufficient meat (${rawMeatCount}) and wool (${woolCount}). Returning!`);
    break;
  }
}

// 3. Return to base
console.log('Returning to base entrance at (294, 72, -53)...');
await lib.goTo(294, 72, -53, 1);

// Step through door
try {
  await lib.door(294, 72, -54, true);
  await sleep(200);
  await lib.walkTo(293.5, -56.0, 3000);
  await lib.door(294, 72, -54, false);
} catch (e) {
  console.log('Enter base door error:', e.message);
}

console.log('Inside base at:', lib.fmt(bot.entity.position));
console.log('Inventory now:', JSON.stringify(lib.inv()));

// 4. Smelt meat
const meats = ['mutton', 'beef', 'porkchop', 'chicken'];
for (const m of meats) {
  const c = lib.count(m);
  if (c > 0 && lib.count('oak_planks') > 0) {
    console.log(`Smelting ${c} of ${m}...`);
    try {
      await lib.smelt(m, 'oak_planks', c);
    } catch (e) {
      console.log(`Smelt ${m} error:`, e.message);
    }
  }
}

// 5. Eat cooked food to restore hunger
const cookedMeats = ['cooked_mutton', 'cooked_beef', 'cooked_porkchop', 'cooked_chicken'];
for (const cm of cookedMeats) {
  while (bot.food < 20 && lib.count(cm) > 0) {
    console.log(`Eating ${cm}...`);
    const ok = await safeEatFood(cm);
    if (!ok) break;
    console.log(`Ate! Food now: ${bot.food}/20`);
  }
}

console.log('End status: Health:', bot.health, 'Food:', bot.food, 'Time:', lib.time().timeOfDay);
