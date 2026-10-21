// programs/130-check-beds-and-prepare-sleep.js
// 1. Check all beds in base
// 2. Harvest smelted ingots from furnace
// 3. Craft iron_boots for Beta if Beta hasn't yet, or hand over 2 ingots
// 4. Stand near Bed 1 ready to sleep when night falls

console.log('alpha at:', lib.fmt(bot.entity.position), '| food:', bot.food, '| health:', bot.health);

// Check beds
const beds = bot.findBlocks({
  matching: mcData.blocksByName.white_bed?.id,
  maxDistance: 16,
  count: 10
});
console.log('Beds in base:', beds.map(p => lib.fmt(p)).join(', '));

// Check furnace 1 for finished iron ingots
const f1 = bot.blockAt(new Vec3(295, 72, -55));
let harvested = 0;
if (f1 && f1.name === 'furnace') {
  try {
    const furnace = await bot.openFurnace(f1);
    console.log('Furnace status: input=', furnace.inputItem()?.count, 'output=', furnace.outputItem()?.count);
    if (furnace.outputItem() && furnace.outputItem().name === 'iron_ingot') {
      harvested = furnace.outputItem().count;
      console.log(`Harvesting ${harvested} iron ingots...`);
      await furnace.takeOutput();
    }
    furnace.close();
  } catch (e) {
    console.log('Furnace error:', e.message);
  }
}

console.log('Alpha iron ingots now:', lib.count('iron_ingot'));

// If Alpha harvested 2 ingots and Beta has 2 ingots in inventory:
// Alpha can craft iron_boots right now!
if (lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots for Beta...');
  await lib.craft('iron_boots', 1);
  console.log('Iron boots crafted! Depositing into base chest for Beta...');
  await lib.deposit({ iron_boots: 1 }, 293, 72, -57);
  bot.chat('alpha: Crafted iron_boots and put them in the base chest for you beta!');
} else if (lib.count('iron_ingot') > 0) {
  console.log('Depositing iron ingots into base chest for Beta...');
  await lib.deposit({ iron_ingot: 'all' }, 293, 72, -57);
  bot.chat(`alpha: Put ${harvested} iron ingots in base chest for your boots beta!`);
}

// Stand near bed
await lib.walkTo(293.5, -55.5);
console.log('Standing by bed. Night in:', lib.time().secondsUntilNight);
