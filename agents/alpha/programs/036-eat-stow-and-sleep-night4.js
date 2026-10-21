// programs/036-eat-stow-and-sleep-night4.js
// Eat, stow inventory clutter into chest, craft beta shield, sleep with beta to skip Night 4

console.log('alpha at:', lib.fmt(bot.entity.position), 'timeOfDay:', lib.time().timeOfDay);

// 1. Eat food
if (bot.food < 18) {
  try {
    await lib.eat();
    console.log('Food after eating:', bot.food);
  } catch (e) {
    console.log('Eat note:', e.message);
  }
}

// 2. Stow inventory clutter into base chest
const chestPos = { x: 293, y: 72, z: -57 };
try {
  await lib.deposit({ granite: 'all', diorite: 'all', egg: 'all', cobblestone: 90 }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Stowed clutter into chest');
} catch (e) {
  console.log('Deposit note:', e.message);
}

// 3. Check furnace for output ingots
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    if (furnace.outputItem()) {
      console.log(`Took ${furnace.outputItem().count} ${furnace.outputItem().name} from furnace`);
      await furnace.takeOutput();
    }
    furnace.close();
  } catch (e) {
    console.log('Furnace note:', e.message);
  }
}

console.log('Iron ingots available now:', lib.count('iron_ingot'));

// 4. Craft shield for beta if we have planks
if (lib.count('*_planks') < 6 && lib.count('*_log') > 0) {
  await lib.craft('oak_planks', 4);
}
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  try {
    await lib.craft('shield', 1);
    await lib.deposit({ shield: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Crafted and deposited shield for beta');
  } catch (e) {
    console.log('Shield craft note:', e.message);
  }
}

bot.chat('alpha: Stowed clutter, chest ready. Waiting for 12542 to sleep in bed with beta.');

// 5. Wait for tick 12542
while (!isCancelled()) {
  const t = lib.time();
  if (t.canSleep || t.timeOfDay >= 12542) {
    console.log(`canSleep true at ${t.timeOfDay}! Sleeping in bed...`);
    break;
  }
  await sleep(2000);
}

// 6. Sleep in bed
try {
  await lib.sleepInBed();
  console.log('In bed!');
} catch (e) {
  console.log('Sleep note:', e.message);
}

// Wait until morning
for (let i = 0; i < 30; i++) {
  await sleep(1000);
  const t = lib.time();
  if (!t.night && (t.timeOfDay < 1000 || t.timeOfDay >= 23460)) {
    console.log(`Morning reached! Day 5! timeOfDay: ${t.timeOfDay}`);
    break;
  }
}

const finalTime = lib.time();
console.log('Final time:', finalTime);

return {
  time: finalTime,
  food: bot.food,
  ingots: lib.count('iron_ingot')
};
