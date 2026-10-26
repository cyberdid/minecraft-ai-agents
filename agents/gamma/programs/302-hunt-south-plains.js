// programs/302-hunt-south-plains.js
console.log('=== HUNT SOUTH PLAINS FOR FOOD ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);

// 1. Check chest at (293, 72, -57) first
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(contents));
  // If any edible food exists in chest, take it!
  const edible = ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple', 'baked_potato', 'beef', 'porkchop', 'mutton'];
  for (const foodItem of edible) {
    if (contents[foodItem]) {
      console.log(`Withdrawing ${contents[foodItem]}x ${foodItem} from chest...`);
      await lib.withdraw({ [foodItem]: contents[foodItem] }, 293, 72, -57);
    }
  }
} catch (e) {
  console.log('Chest check note:', e.message);
}

// If we got food from chest, eat or cook it
for (const foodItem of ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple']) {
  if (lib.count(foodItem) > 0) {
    console.log(`Eating ${foodItem}...`);
    await lib.eat();
  }
}

if (bot.food >= 18) {
  console.log('Fully fed from chest! Food:', bot.food);
} else {
  // 2. Equip stone sword
  await lib.equipWeapon();

  // 3. Exit base door at (294, 72, -54)
  console.log('Exiting base towards South...');
  try {
    await lib.goTo(294, 72, -55, 1, { timeoutMs: 4000 });
    await lib.goThroughDoor(294, 72, -54);
    console.log('Outside base at:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Door exit note:', e.message);
    try { await lib.door(294, 72, -54, true); await lib.walkTo(294.5, -52.5, 3000); await lib.door(294, 72, -54, false); } catch (e2) {}
  }

  // 4. Hunt animals in South grass plains (z = -30 to +20)
  const targetTypes = ['sheep', 'cow', 'pig', 'chicken'];
  const huntStart = Date.now();
  let hunted = 0;

  console.log('Marching South to search for wildlife...');
  const searchWaypoints = [
    new Vec3(294, 72, -35),
    new Vec3(294, 72, -15),
    new Vec3(280, 71, 0),
    new Vec3(310, 71, 0),
    new Vec3(295, 71, 20)
  ];

  for (const wp of searchWaypoints) {
    if (isCancelled() || hunted >= 4 || lib.time().secondsUntilNight < 150) break;
    console.log(`Searching around waypoint ${lib.fmt(wp)}...`);
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 3, { timeoutMs: 12000 });
    } catch (e) {
      console.log('Waypoint move note:', e.message);
    }

    // Check for animals within 48 blocks
    const animals = Object.values(bot.entities).filter(e => {
      if (!e || !e.name || !e.position) return false;
      return targetTypes.includes(e.name) && bot.entity.position.distanceTo(e.position) < 48;
    }).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

    console.log(`Found ${animals.length} animals near ${lib.fmt(bot.entity.position)}`);

    for (const target of animals) {
      if (hunted >= 4 || isCancelled()) break;
      console.log(`Hunting ${target.name} at ${lib.fmt(target.position)}...`);
      try {
        await lib.goTo(target.position.x, target.position.y, target.position.z, 2, { timeoutMs: 10000 });
        for (let hit = 0; hit < 4; hit++) {
          if (!bot.entities[target.id]) break;
          await bot.lookAt(target.position.offset(0, target.height ? target.height * 0.5 : 0.5, 0), true);
          bot.attack(target);
          await sleep(650);
        }
        await sleep(300);
        await lib.pickup(6);
        hunted++;
        console.log(`Hunted ${target.name}! Meat in inv:`, JSON.stringify(lib.inv()));
      } catch (err) {
        console.log(`Failed to hunt ${target.name}:`, err.message);
      }
    }
  }

  // 5. Return to base
  console.log('Returning to base at (294, 72, -54)...');
  try {
    await lib.goTo(294, 72, -53, 1, { timeoutMs: 25000 });
    await lib.goThroughDoor(294, 72, -54);
    console.log('Safely inside base!');
  } catch (e) {
    console.log('Base return note:', e.message);
    try { await lib.door(294, 72, -54, true); await lib.walkTo(294.5, -55.5, 3000); } catch (e2) {}
  }

  // 6. Cook all raw meat in furnace at (295, 72, -55)
  for (const raw of ['beef', 'mutton', 'porkchop', 'chicken']) {
    const c = lib.count(raw);
    if (c > 0) {
      console.log(`Cooking ${c}x ${raw} in furnace...`);
      try {
        await lib.goTo(295, 72, -55, 2, { timeoutMs: 5000 });
        await lib.smelt(raw, 'oak_planks', c);
      } catch (e) {
        console.log('Smelt note:', e.message);
      }
    }
  }

  // 7. Eat cooked food!
  try {
    await lib.eat();
    console.log('Ate meal! Food level now:', bot.food);
  } catch (e) {
    console.log('Eat note:', e.message);
  }
}

console.log('\n=== STATUS AT END ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma status: Food=${bot.food}/20, HP=${bot.health}/20, Planks=${lib.count('*_planks')}, Cobble=${lib.count('cobblestone')}`);
