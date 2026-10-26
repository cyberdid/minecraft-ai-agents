// programs/044-finish-iron-armor-and-sleep.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Check base furnaces for remaining iron ingots
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

console.log('Iron ingots now in inventory:', lib.count('iron_ingot'));

// 2. Craft remaining armor
await lib.ensureTable();
if (lib.count('iron_ingot') >= 7 && !lib.count('iron_leggings')) {
  console.log('Crafting iron_leggings...');
  try { await lib.craft('iron_leggings', 1); } catch (e) {}
}
if (lib.count('iron_ingot') >= 5 && !lib.count('iron_helmet')) {
  console.log('Crafting iron_helmet...');
  try { await lib.craft('iron_helmet', 1); } catch (e) {}
}
if (lib.count('iron_ingot') >= 3 && !lib.count('iron_pickaxe')) {
  console.log('Crafting iron_pickaxe...');
  try { await lib.craft('iron_pickaxe', 1); } catch (e) {}
}

// 3. Equip armor
await lib.equipArmor();

// 4. Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

bot.chat(`gamma wearing: chestplate, boots, shield. Ingots: ${lib.count('iron_ingot')}. Waiting for night sleep!`);

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
    console.log(`Bed at ${lib.fmt(bedPos)} error: ${err.message}`);
  }
}

// 7. Wait safely until dawn
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

// Collect any freshly smelted ingots
for (const pos of furnaces) {
  const bl = bot.blockAt(pos);
  if (!bl || bl.name !== 'furnace') continue;
  try {
    const f = await bot.openFurnace(bl);
    if (f.outputItem()) {
      await f.takeOutput();
    }
    f.close();
  } catch (e) {}
}

await lib.equipArmor();

console.log('Dawn reached! Inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma dawn status: gear=${JSON.stringify(lib.tools())}`);
