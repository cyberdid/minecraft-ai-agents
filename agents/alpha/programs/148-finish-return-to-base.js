// programs/148-finish-return-to-base.js
console.log('--- Finishing Return to Base ---');
console.log('Current pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight);

// 1. Walk to base entrance
console.log('Navigating to (294, 72, -53)...');
await lib.goTo(294, 72, -53, 1);

console.log('Arrived at entrance! Pos:', lib.fmt(bot.entity.position));

// 2. Step inside through door
try {
  await lib.door(294, 72, -54, true);
  await sleep(200);
  await lib.walkTo(293.5, -56.0, 3000);
  await lib.door(294, 72, -54, false);
  console.log('Door closed behind us.');
} catch (e) {
  console.log('Door entry error:', e.message);
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {
    console.log('goThroughDoor error:', e2.message);
  }
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Deposit feathers and eggs
try {
  console.log('Depositing feathers and eggs into chest...');
  await lib.deposit({ feather: 'all', egg: 'all' }, 293, 72, -57);
} catch (e) {
  console.log('Deposit error:', e.message);
}

// 4. Check base chest and furnaces for iron
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest error:', e.message);
}

for (const f of [new Vec3(295, 72, -54), new Vec3(295, 72, -55), new Vec3(295, 72, -56)]) {
  const blk = bot.blockAt(f);
  if (blk && blk.name.includes('furnace')) {
    try {
      const furn = await bot.openFurnace(blk);
      console.log(`Furnace ${lib.fmt(f)}: in=${furn.inputItem()?.name}x${furn.inputItem()?.count}, out=${furn.outputItem()?.name}x${furn.outputItem()?.count}`);
      if (furn.outputItem()) await furn.takeOutput();
      furn.close();
    } catch (e) {}
  }
}

// 5. Craft shield if we have 1 iron and planks
const ironCount = lib.count('iron_ingot');
console.log('Iron ingots in inventory:', ironCount);
if (ironCount >= 1 && lib.count('*_planks') >= 6 && lib.count('shield') === 0) {
  console.log('Crafting shield...');
  try {
    await lib.craft('shield', 1);
    await lib.equipArmor();
    console.log('Shield crafted and equipped in offhand!');
    bot.chat('alpha: Crafted and equipped shield! Milestone 3 ready!');
  } catch (e) {
    console.log('Shield craft error:', e.message);
  }
}

bot.chat('alpha: Inside base, reunited with Beta. Safe before nightfall.');
console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Night in:', lib.time().secondsUntilNight, 's');
