// programs/213-sleep-night-and-gear-up.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Time start:', JSON.stringify(lib.time()));

// 1. Wait for canSleep (tick >= 12542) and sleep in bed
console.log('Waiting for sleep time (tick >= 12542)...');
for (let i = 0; i < 35; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.canSleep) {
    console.log(`canSleep is true! Time: ${t.timeOfDay}. Sleeping in bed...`);
    try {
      await lib.sleepInBed();
      console.log('Slept in bed!');
      bot.chat('delta: Slept in base bed with team, night skipped to dawn!');
    } catch (e) {
      console.log('Sleep notice:', e.message);
    }
    break;
  }
  await sleep(1000);
}

await sleep(2000);
console.log('Time after sleep:', JSON.stringify(lib.time()));

// 2. Deposit 1 cooked porkchop in chest for teammates
try {
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock && lib.count('cooked_porkchop') > 1) {
    const chest = await bot.openChest(chestBlock);
    const item = bot.inventory.items().find(i => i.name === 'cooked_porkchop');
    if (item) {
      await chest.deposit(item.type, null, 1);
      console.log('Deposited 1 cooked_porkchop in chest for teammates!');
      bot.chat('delta: Deposited 1 cooked porkchop in chest for team!');
    }
    chest.close();
  }
} catch (e) {
  console.log('Chest deposit error:', e.message);
}

// 3. Eat 1 cooked porkchop if food < 20
if (bot.food < 20 && lib.count('cooked_porkchop') > 0) {
  try {
    await lib.eat();
    console.log('Ate cooked porkchop! Food now:', bot.food);
  } catch (e) {}
}

// 4. Obtain stone_pickaxe
console.log('Obtaining stone_pickaxe...');
try {
  await lib.obtain('stone_pickaxe', 1);
  console.log('Obtained stone_pickaxe!');
} catch (e) {
  console.log('Pickaxe error:', e.message);
}

// 5. Obtain stone_sword
console.log('Obtaining stone_sword...');
try {
  await lib.obtain('stone_sword', 1);
  console.log('Obtained stone_sword!');
} catch (e) {
  console.log('Sword error:', e.message);
}

// 6. Obtain 32 cobblestone
console.log('Obtaining 32 cobblestone...');
try {
  await lib.obtain('cobblestone', 32);
  console.log('Obtained 32 cobblestone!');
} catch (e) {
  console.log('Cobblestone error:', e.message);
}

// 7. Return to base shelter
const doorPos = new Vec3(294, 73, -54);
console.log('Returning to base entrance...');
try {
  await lib.goTo(doorPos.x, doorPos.y, doorPos.z, 2);
} catch (e) {}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final tools:', JSON.stringify(lib.tools()));
bot.chat(`delta: Re-armed & fed! Pickaxe=${lib.count('stone_pickaxe')}, Sword=${lib.count('stone_sword')}, Cobble=${lib.count('cobblestone')}, Food=${bot.food}. Ready for Nether!`);
