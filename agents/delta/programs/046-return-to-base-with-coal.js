// programs/046-return-to-base-with-coal.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// Keep gaze low to avoid Endermen
await bot.look(0, -0.5, true);

// 1. Return to base along XZ
console.log('Navigating to base (294, 72, -52)...');
await lib.goToXZ(294, -52);
console.log('Near base at:', lib.fmt(bot.entity.position));

// 2. Approach and enter base door
const doorPos = new Vec3(294, 72, -54);
await lib.goTo(doorPos.x, doorPos.y, doorPos.z + 1, 1);

const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  console.log('Opening door...');
  await bot.activateBlock(door);
  await sleep(200);
}
await lib.walkTo(294, -56);
if (door && bot.blockAt(doorPos).getProperties().open) {
  console.log('Closing door...');
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Deposit coal into base chest and furnaces
const chestPos = new Vec3(293, 72, -57);
if (lib.count('coal') > 0) {
  console.log(`Depositing ${lib.count('coal')} coal into base chest...`);
  await lib.deposit({ coal: 'all' }, chestPos.x, chestPos.y, chestPos.z);
}

// 4. Check furnaces, take finished iron ingots
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    console.log(`Furnace at ${lib.fmt(f)}: in=${fw.inputItem()?.name}x${fw.inputItem()?.count} out=${fw.outputItem()?.name}x${fw.outputItem()?.count}`);
    if (fw.outputItem()) {
      await fw.takeOutput();
      console.log('Took smelted output!');
    }
    await fw.close();
  } catch (err) {
    console.log('Furnace error:', err.message);
  }
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// 5. If we have iron ingots, craft armor
const table = bot.findBlocks({ matching: b => b.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
if (table && lib.count('iron_ingot') >= 4) {
  const tableBlock = bot.blockAt(table);
  // Try craft armor pieces
  const pieces = [
    { name: 'iron_chestplate', cost: 8 },
    { name: 'iron_leggings', cost: 7 },
    { name: 'iron_helmet', cost: 5 },
    { name: 'iron_boots', cost: 4 }
  ];
  for (const piece of pieces) {
    if (!lib.count(piece.name) && lib.count('iron_ingot') >= piece.cost) {
      console.log(`Crafting ${piece.name}...`);
      const item = mcData.itemsByName[piece.name];
      const rec = bot.recipesFor(item.id, null, 1, tableBlock)[0];
      if (rec) {
        await bot.craft(rec, 1, tableBlock);
        await sleep(200);
        await lib.stowCursor();
      }
    }
  }
  await lib.equipArmor();
  console.log('Armor equipped! Inv now:', JSON.stringify(lib.inv()));
}

// 6. Sleep in Bed 2 when time is right
while (!isCancelled() && lib.time().timeOfDay < 12542 && lib.time().secondsUntilNight > 0) {
  await sleep(1000);
}

if (lib.time().canSleep) {
  console.log('Sleeping in Bed 2...');
  try {
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

bot.chat(`delta: Inside base. Coal delivered! Iron ingots: ${lib.count('iron_ingot')}. Armor ready!`);
