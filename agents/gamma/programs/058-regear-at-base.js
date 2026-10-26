// programs/058-regear-at-base.js
bot.chat('gamma respawned safely at base bed! Re-gearing from base chest & furnaces.');

console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Withdraw materials from base chest (293, 72, -57)
const chest = await lib.chestContents(293, 72, -57);
console.log('Base chest:', JSON.stringify(chest));

if (chest.cobblestone >= 20) {
  console.log('Withdrawing 20 cobblestone...');
  await lib.withdraw({ cobblestone: 20 }, 293, 72, -57);
}
if (chest.coal >= 4) {
  console.log('Withdrawing 4 coal...');
  await lib.withdraw({ coal: 4 }, 293, 72, -57);
}

// 2. Check base furnaces for iron ingots
const furnaces = [new Vec3(295, 72, -55), new Vec3(295, 72, -57)];
for (const pos of furnaces) {
  const bl = bot.blockAt(pos);
  if (!bl || bl.name !== 'furnace') continue;
  try {
    const f = await bot.openFurnace(bl);
    if (f.outputItem()) {
      console.log(`Took ${f.outputItem().count} ${f.outputItem().name} from ${lib.fmt(pos)}`);
      await f.takeOutput();
    }
    f.close();
  } catch (e) {}
}

// 3. Ask teammates for spare planks or craft tools
console.log('Inventory before crafting:', JSON.stringify(lib.inv()));

// 4. Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// 5. Wait for sleep time (12542)
console.log('Waiting for sleep time (12542)... current:', bot.time.timeOfDay);
while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  await sleep(1000);
}

// 6. Sleep in bed
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
    console.log(`Bed at ${lib.fmt(bedPos)} note: ${err.message}`);
  }
}

// 7. Wait until dawn
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
bot.chat(`gamma dawn status: inv=${JSON.stringify(lib.inv())}. Ready for day operations!`);
