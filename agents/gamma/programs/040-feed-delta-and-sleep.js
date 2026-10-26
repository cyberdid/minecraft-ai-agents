// programs/040-feed-delta-and-sleep.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Cook beef in furnace at (295, 72, -55)
const fBlock = bot.blockAt(new Vec3(295, 72, -55));
if (fBlock && lib.count('beef') > 0) {
  try {
    const f = await bot.openFurnace(fBlock);
    const beefItem = bot.inventory.items().find(i => i.name === 'beef');
    if (beefItem) await f.putInput(beefItem.type, null, beefItem.count);
    if (!f.fuelItem() && lib.count('coal') > 0) {
      const coal = bot.inventory.items().find(i => i.name === 'coal');
      if (coal) await f.putFuel(coal.type, null, 1);
    }
    console.log('Cooking beef for Delta...');
    const deadline = Date.now() + 15000;
    while (!isCancelled() && Date.now() < deadline) {
      await sleep(1000);
      if (f.outputItem()) break;
    }
    if (f.outputItem()) {
      console.log('Cooked:', f.outputItem().name, 'x' + f.outputItem().count);
      await f.takeOutput();
    }
    f.close();
  } catch (e) {
    console.log('Furnace error:', e.message);
  }
}

// 2. Toss cooked food to Delta
const delta = bot.players.delta?.entity;
if (delta && lib.count('cooked_beef') > 0) {
  console.log(`Tossing cooked_beef to Delta at ${lib.fmt(delta.position)}...`);
  await bot.lookAt(delta.position.offset(0, 1.6, 0));
  await bot.toss(mcData.itemsByName.cooked_beef.id, null, 1);
  bot.chat('delta: tossed you cooked_beef! Eat up to regenerate health!');
} else {
  console.log('Delta not near or no cooked_beef, putting cooked_beef in base chest');
  if (lib.count('cooked_beef') > 0) {
    try {
      await lib.deposit({ cooked_beef: 1 }, 293, 72, -57);
      bot.chat('delta: placed cooked_beef in base chest (293, 72, -57) for you!');
    } catch (e) {}
  }
}

// 3. Make sure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// 4. Wait for sleep time (12542)
console.log('Waiting for sleep time (12542)... current:', bot.time.timeOfDay);
while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  await sleep(1000);
}

// 5. Sleep in bed
const beds = bot.findBlocks({ matching: (bl) => bot.isABed(bl), maxDistance: 16 });
for (const bedPos of beds) {
  const bedBlock = bot.blockAt(bedPos);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(bedPos.x, bedPos.y, bedPos.z, 1));
    await bot.sleep(bedBlock);
    console.log(`Sleeping in bed at ${lib.fmt(bedPos)}!`);
    bot.chat('gamma is sleeping in bed!');
    break;
  } catch (err) {
    console.log(`Bed at ${lib.fmt(bedPos)} not available: ${err.message}`);
  }
}

// 6. Wait safely until dawn
while (!isCancelled()) {
  const t = bot.time.timeOfDay;
  if (t >= 23460 || t < 1000) {
    console.log(`Morning arrived! Tick: ${t}`);
    bot.chat('Morning! gamma waking up.');
    break;
  }
  await sleep(3000);
}

if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

console.log('Dawn reached! Inventory:', JSON.stringify(lib.inv()));
bot.chat('Good morning team! Nether portal is lit. Ready for East hill iron expedition!');
