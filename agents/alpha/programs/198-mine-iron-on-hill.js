// programs/198-mine-iron-on-hill.js
console.log('--- Mine Iron on East Hill (350, 55, -35) ---');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight);

// 1. Check furnaces for food
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];
for (const pos of furnacePositions) {
  const block = bot.blockAt(pos);
  if (block && block.name === 'furnace') {
    try {
      const furn = await bot.openFurnace(block);
      const out = furn.outputItem();
      if (out && (out.name.startsWith('cooked_') || out.name === 'bread')) {
        console.log(`Found cooked food in furnace: ${out.name} x${out.count}`);
        await furn.takeOutput();
      }
      furn.close();
    } catch (e) {}
  }
}

// Eat if we picked up cooked food to reach food >= 18
const cooked = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken'];
for (const c of cooked) {
  if (lib.count(c) > 0 && bot.food < 18) {
    console.log(`Eating ${c}...`);
    if (typeof safeEat === 'function') await safeEat(c);
    else await lib.eat();
    console.log(`Food now: ${bot.food}, Health: ${bot.health}`);
  }
}

// 2. Chat with Beta
bot.chat('beta: Heading to east hill (350, -35) to mine iron. Please smelt your meat and craft Bed 2 with your wool.');

// 3. Step outside base door
try {
  if (typeof passDoorOut === 'function') {
    await passDoorOut();
  } else {
    await lib.goThroughDoor(294, 72, -54);
  }
  console.log('Outside base! Current pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door exit note:', e.message);
}

// 4. Travel to East hill (350, 55, -35)
console.log('Navigating to East hill (350, -35)...');
try {
  await lib.goToXZ(350, -35, { timeoutMs: 30000 });
  console.log('Arrived near East hill! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Travel warning:', e.message);
  try {
    await lib.goTo(350, 65, -35, 5, { timeoutMs: 25000 });
  } catch (e2) {}
}

// 5. Scan and mine iron ores
console.log('Scanning for iron ores on the hill...');
let minedIron = 0;
let minedCoal = 0;

for (let round = 0; round < 3; round++) {
  if (isCancelled() || lib.time().secondsUntilNight < 110) break;
  if (lib.count('raw_iron') >= 20) break;

  const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 20 });
  console.log(`Round ${round + 1}: Found ${ores.length} iron ore blocks in range.`);
  
  if (ores.length === 0) {
    // Try exploring slightly across the hillside
    console.log('Looking slightly further along hillside...');
    const coal = lib.find('coal_ore', { maxDistance: 24, count: 10 });
    for (const c of coal) {
      if (lib.count('coal') >= 16 || lib.time().secondsUntilNight < 110) break;
      try {
        await lib.goTo(c.position.x, c.position.y, c.position.z, 2, { dig: true });
        await lib.dig(c.position.x, c.position.y, c.position.z);
        await lib.pickup(4);
        minedCoal++;
      } catch (e) {}
    }
  }

  for (const ore of ores) {
    if (isCancelled() || lib.time().secondsUntilNight < 110) break;
    if (lib.count('raw_iron') >= 20) break;

    try {
      console.log(`Mining iron at ${lib.fmt(ore.position)}...`);
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true });
      await lib.dig(ore.position.x, ore.position.y, ore.position.z);
      await lib.pickup(4);
      minedIron++;
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(ore.position)}:`, e.message);
    }
  }
}

// Also grab some coal if nearby and time permits
if (lib.time().secondsUntilNight > 110 && lib.count('coal') < 8) {
  const coalOres = lib.find('coal_ore', { maxDistance: 24, count: 10 });
  for (const c of coalOres) {
    if (lib.count('coal') >= 8 || lib.time().secondsUntilNight < 110) break;
    try {
      await lib.goTo(c.position.x, c.position.y, c.position.z, 2, { dig: true });
      await lib.dig(c.position.x, c.position.y, c.position.z);
      await lib.pickup(4);
      minedCoal++;
    } catch (e) {}
  }
}

console.log(`Mining finished. Raw iron: ${lib.count('raw_iron')}, Coal: ${lib.count('coal')}`);

// 6. Return to base before dusk
console.log('Returning to base entrance (294, 72, -52)...');
try {
  await lib.goTo(294, 72, -52, 1, { timeoutMs: 30000 });
} catch (e) {
  console.log('Return goTo warning:', e.message);
  try { await lib.goToXZ(294, -52); } catch (e2) {}
}

console.log('Entering base...');
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

bot.chat(`beta: Returned to base. Gained ${lib.count('raw_iron')} raw iron and ${lib.count('coal')} coal.`);
console.log('End pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight, 's');
