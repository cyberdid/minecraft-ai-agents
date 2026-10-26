// programs/488-return-to-base-and-sleep-with-alpha.js
console.log('=== Step: Return to Base & Sleep with Alpha ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', bot.time.nightIn);

// 1. Walk to base door exterior (294, 72, -53)
try {
  await lib.goTo(294, 72, -53, 1.5);
  console.log('At base door exterior:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Path error:', e.message);
  await lib.walkTo(294, -53);
}

// 2. Open door and step into base
try {
  await lib.goThroughDoor(294, 72, -54, { close: true });
  console.log('Safely inside base at', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door pass error, trying manual door:', e.message);
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// 3. Craft birch_planks from birch_log (inventory craft)
const logItem = bot.inventory.items().find(i => i.name === 'birch_log');
if (logItem) {
  const recipe = bot.recipesFor(mcData.itemsByName.birch_planks.id, null, 1, null)[0];
  if (recipe) {
    await bot.craft(recipe, logItem.count, null);
    console.log(`Crafted birch_planks! Total: ${lib.count('birch_planks')}`);
  }
}

// 4. Craft 4 sticks
if (lib.count('birch_planks') >= 2) {
  const stickRecipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (stickRecipe) {
    await bot.craft(stickRecipe, 1, null);
    console.log(`Crafted sticks! Total: ${lib.count('stick')}`);
  }
}

bot.chat('beta: Inside base with Alpha! Standing by at Bed 2 to sleep at sunset.');

// 5. Sleep loop: wait for night and sleep in Bed 2 (293, 72, -55)
const bed2Pos = new Vec3(293, 72, -55);
for (let t = 0; t < 50; t++) {
  if (isCancelled()) break;
  const time = bot.time.timeOfDay;
  const isNight = time >= 12542 && time <= 23460;
  
  if (isNight && !bot.isSleeping) {
    try {
      const bed = bot.blockAt(bed2Pos);
      if (bed) {
        console.log(`Sleeping in Bed 2 at ${lib.fmt(bed2Pos)}...`);
        await bot.sleep(bed);
        console.log('Successfully sleeping in Bed 2!');
      }
    } catch (err) {
      console.log('Bed 2 sleep note:', err.message);
      // Try Bed 1 if Bed 2 fails
      try {
        const bed1 = bot.blockAt(new Vec3(294, 72, -56));
        if (bed1) await bot.sleep(bed1);
      } catch (e) {}
    }
  }
  
  // Dawn arrived
  if (time < 1000 && t > 5) {
    console.log('DAWN HAS ARRIVED! Time:', time);
    break;
  }
  
  await sleep(1000);
}

if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

console.log('Dawn status: Time=', bot.time.timeOfDay, 'HP=', bot.health, 'Food=', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`beta: Dawn reached! Inv=${JSON.stringify(lib.inv())}. Crafting stone tools now!`);
