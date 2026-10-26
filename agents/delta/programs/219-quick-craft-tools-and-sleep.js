// programs/219-quick-craft-tools-and-sleep.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Time start:', JSON.stringify(lib.time()));

// 1. Step outside door
const doorPos = new Vec3(294, 73, -54);
console.log('Stepping outside door to harvest 2 logs...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
} catch (e) {
  await lib.goTo(296, 73, -54, 1);
}

// 2. Harvest 2 logs
try {
  await lib.collect('*_log', 2);
  console.log('Logs harvested!');
} catch (e) {
  console.log('Log notice:', e.message);
}

// 3. Craft planks, sticks, wooden pickaxe
try {
  if (lib.count('birch_log') > 0) await lib.craft('birch_planks', lib.count('birch_log') * 4);
  if (lib.count('oak_log') > 0) await lib.craft('oak_planks', lib.count('oak_log') * 4);
  await lib.craft('stick', 4);
  await lib.craft('wooden_pickaxe', 1);
  console.log('Crafted wooden pickaxe!');
} catch (e) {
  console.log('Wood craft notice:', e.message);
}

// 4. Mine 6 stone with wooden pickaxe
try {
  await lib.collect('stone', 6);
  console.log('Mined stone!');
} catch (e) {}

// 5. Craft stone pickaxe and stone sword
try {
  if (lib.count('cobblestone') >= 3) await lib.craft('stone_pickaxe', 1);
  if (lib.count('cobblestone') >= 2) await lib.craft('stone_sword', 1);
  console.log('Crafted stone tools!');
} catch (e) {}

// 6. Mine 12 extra cobblestone with stone pickaxe
if (lib.count('stone_pickaxe') > 0) {
  try {
    await lib.collect('stone', 12);
    console.log('Mined extra cobble! Total:', lib.count('cobblestone'));
  } catch (e) {}
}

// 7. Return inside base shelter
console.log('Returning inside base shelter...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
} catch (e) {
  await lib.goTo(293, 72, -55, 1);
}

// 8. Wait for dusk/night (tick >= 12542) and sleep in bed
console.log('Waiting for sleep time (tick >= 12542)...');
for (let i = 0; i < 60; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.canSleep) {
    console.log(`canSleep is true! Time: ${t.timeOfDay}. Sleeping in bed...`);
    try {
      await lib.sleepInBed();
      console.log('Slept in bed! Night skipped to dawn.');
      bot.chat('delta: Slept in base bed with team, morning arrived!');
    } catch (e) {
      console.log('Sleep notice:', e.message);
    }
    break;
  }
  await sleep(1000);
}

await sleep(2000);
console.log('Final time info:', JSON.stringify(lib.time()));
console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final tools:', JSON.stringify(lib.tools()));
bot.chat(`delta: Re-armed & awake at dawn! Pickaxe=${lib.count('stone_pickaxe')}, Sword=${lib.count('stone_sword')}, Cobble=${lib.count('cobblestone')}. Entering Nether!`);
