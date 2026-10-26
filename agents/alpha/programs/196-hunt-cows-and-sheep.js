// programs/196-hunt-cows-and-sheep.js
console.log('--- Hunting Cows and Sheep North of Base ---');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight);

if (lib.time().secondsUntilNight < 110) {
  console.log('Night is approaching (<110s). Staying in base.');
} else {
  bot.chat('beta: Hunting cows and sheep North of base for food and Bed 2 wool. Will return before dusk.');
  
  try {
    if (typeof passDoorOut === 'function') {
      await passDoorOut();
    } else {
      await lib.goThroughDoor(294, 72, -54);
    }
    console.log('Stepped outside door. Current pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Door exit error:', e.message);
  }

  // Hunt loop
  const huntStartTime = Date.now();
  let cowsKilled = 0;
  let sheepKilled = 0;

  while (lib.time().secondsUntilNight > 100 && (Date.now() - huntStartTime < 45000)) {
    // Scan entities for nearest cow or sheep
    const targets = Object.values(bot.entities)
      .filter(e => e && (e.name === 'cow' || e.name === 'sheep') && e.position)
      .map(e => ({ name: e.name, id: e.id, dist: e.position.distanceTo(bot.entity.position), pos: e.position }))
      .sort((a, b) => a.dist - b.dist);

    if (targets.length === 0 || targets[0].dist > 75) {
      console.log('No close cows/sheep found. Breaking hunt loop.');
      break;
    }

    const t = targets[0];
    console.log(`Hunting nearest ${t.name} at ${lib.fmt(t.pos)} (dist ${t.dist.toFixed(1)})...`);
    try {
      const r = await lib.hunt(t.name, 1);
      console.log(`Hunt result:`, JSON.stringify(r));
      if (t.name === 'cow') cowsKilled++;
      if (t.name === 'sheep') sheepKilled++;
    } catch (e) {
      console.log('Hunt target error:', e.message);
      break;
    }

    if (cowsKilled >= 3 && sheepKilled >= 3) break;
  }

  // Return to base door
  console.log('Returning to base entrance (294, 72, -52)...');
  try {
    await lib.goTo(294, 72, -52, 1, { timeoutMs: 30000 });
  } catch (e) {
    console.log('goTo door note:', e.message);
    try { await lib.goToXZ(294, -52); } catch (e2) {}
  }

  console.log('Stepping inside base...');
  try {
    if (typeof passDoorIn === 'function') {
      await passDoorIn();
    } else {
      await lib.goThroughDoor(294, 72, -54);
    }
    console.log('Safely inside base! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Door enter error:', e.message);
  }
}

// Smelt raw meats
const rawMeats = ['beef', 'mutton', 'porkchop', 'chicken'].filter(m => lib.count(m) > 0);
console.log('Raw meats to smelt:', rawMeats);

for (const m of rawMeats) {
  const count = lib.count(m);
  console.log(`Smelting ${count} of ${m}...`);
  try {
    // If no planks, make sure we have fuel
    if (lib.count('*_planks') < 2 && lib.count('*_log') > 0) {
      const log = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
      await lib.craft(log.replace('_log', '_planks'), 4);
    }
    const plankType = Object.keys(lib.inv()).find(k => k.endsWith('_planks')) || 'birch_planks';
    await lib.smelt(m, plankType, count);
    console.log(`Smelted ${m}!`);
  } catch (e) {
    console.log(`Smelt ${m} error:`, e.message);
  }
}

// Eat until food >= 18
const cookedMeats = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken'];
for (const cm of cookedMeats) {
  while (lib.count(cm) > 0 && bot.food < 18) {
    console.log(`Eating ${cm}...`);
    if (typeof safeEat === 'function') {
      await safeEat(cm);
    } else {
      await lib.eat();
    }
    console.log(`Food now: ${bot.food}, Health: ${bot.health}`);
  }
}

// Deposit extra cooked food in chest for Beta
const remainingFood = {};
for (const cm of cookedMeats) {
  if (lib.count(cm) > 0) remainingFood[cm] = lib.count(cm);
}
if (Object.keys(remainingFood).length > 0) {
  console.log('Depositing remaining food in base chest for Beta:', JSON.stringify(remainingFood));
  try {
    await lib.deposit(remainingFood, 293, 72, -57);
    bot.chat(`beta: Placed food in chest for you: ${JSON.stringify(remainingFood)}`);
  } catch (e) {
    console.log('Deposit error:', e.message);
  }
}

// Check wool for Bed 2
const woolTypes = Object.keys(lib.inv()).filter(k => k.endsWith('_wool'));
for (const w of woolTypes) {
  console.log(`Wool: ${w} count: ${lib.count(w)}`);
  if (lib.count(w) >= 3) {
    const bedName = w.replace('_wool', '_bed');
    console.log(`Crafting ${bedName}...`);
    try {
      await lib.craft(bedName, 1);
      console.log(`Placing ${bedName} at Bed 2 spot (293, 72, -56)...`);
      await lib.place(bedName, 293, 72, -56);
      console.log('Bed 2 placed successfully! MILESTONE 4 COMPLETE!');
      bot.chat('beta: Bed 2 crafted and placed at (293, 72, -56)! Milestone 4 complete!');
    } catch (e) {
      console.log('Bed 2 craft/place error:', e.message);
    }
  }
}

console.log('Finished 196. Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight, 's');
