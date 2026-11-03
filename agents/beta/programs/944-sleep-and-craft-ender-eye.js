console.log('=== Program 944: Sleep & Craft Ender Eye ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Bot pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

// Check mcData item name
const eyeItem = mcData.itemsByName['ender_eye'];
const eyeOfEnder = mcData.itemsByName['eye_of_ender'];
console.log('ender_eye item:', eyeItem ? eyeItem.name : 'null');
console.log('eye_of_ender item:', eyeOfEnder ? eyeOfEnder.name : 'null');

// 1. If dusk / night (timeOfDay >= 12542 && timeOfDay <= 23460), sleep in bed
if (bot.time.timeOfDay < 12542) {
  const waitTicks = 12542 - bot.time.timeOfDay;
  console.log(`Waiting ${waitTicks} ticks until sleep time (12542)...`);
  await sleep(Math.min(6000, waitTicks * 50));
}

if (bot.time.timeOfDay >= 12541 && bot.time.timeOfDay <= 23460) {
  console.log('Sleep time active! Finding bed...');
  const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 5 });
  if (bed) {
    try {
      console.log(`Sleeping in bed at ${lib.fmt(bed.position)}...`);
      await bot.sleep(bed);
      console.log('Sleeping... waiting 5s for dawn...');
      await sleep(5000);
      console.log('Woke up! Current time:', bot.time.timeOfDay);
    } catch (e) {
      console.log('Sleep notice:', e.message);
    }
  }
}

// 2. Craft ender_eye
const craftName = eyeItem ? 'ender_eye' : 'eye_of_ender';
const powder = lib.count('blaze_powder');
const pearls = lib.count('ender_pearl');
console.log(`Crafting resources: ${powder} blaze_powder, ${pearls} ender_pearl. Target item: ${craftName}`);

const toCraft = Math.min(powder, pearls);
if (toCraft > 0) {
  console.log(`Crafting ${toCraft} ${craftName}...`);
  try {
    await lib.craft(craftName, toCraft);
    const eyes = lib.count(craftName);
    bot.chat(`Beta: 100% COMPLETE! Crafted ${eyes} Eyes of Ender! Milestone 10 Part 1 ACHIEVED!`);
    console.log(`SUCCESS: ${eyes} ${craftName} CRAFTED!`);
  } catch (err) {
    console.log('lib.craft failed, trying bot.recipesFor:', err.message);
    const itemDef = mcData.itemsByName[craftName];
    if (itemDef) {
      const recipes = bot.recipesFor(itemDef.id, null, 1, null);
      console.log(`Found ${recipes.length} recipes for ${craftName}`);
      if (recipes.length > 0) {
        // Can be crafted in 2x2 player inventory or crafting table
        const table = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 5 });
        await bot.craft(recipes[0], toCraft, table);
        const eyes = lib.count(craftName);
        bot.chat(`Beta: 100% COMPLETE! Crafted ${eyes} Eyes of Ender! Milestone 10 Part 1 ACHIEVED!`);
        console.log(`Crafted via bot.craft! Total ${craftName}: ${eyes}`);
      }
    }
  }
}

console.log('Final Inventory:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  ender_eyes: lib.count('ender_eye'),
  pearls: lib.count('ender_pearl'),
  powder: lib.count('blaze_powder'),
  hp: bot.health,
  food: bot.food,
  time: bot.time.timeOfDay,
  inv: lib.inv()
};
