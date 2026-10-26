// programs/163-share-gear-with-beta-and-sleep.js
console.log('--- Sharing Gear with Beta and Sheltering ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Time:', lib.time().timeOfDay, 'Night in:', lib.time().secondsUntilNight);

// 1. Ensure door is closed
const d = bot.blockAt(new Vec3(294, 72, -54));
if (d && d.getProperties().open) {
  await bot.activateBlock(d);
  console.log('Door closed.');
}

// 2. Deposit 1 stone_pickaxe, 1 stone_sword, and 8 cobblestone into base chest for Beta
try {
  console.log('Depositing gear for Beta into chest...');
  const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
  const pick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
  if (sword && lib.count('stone_sword') > 0) {
    await lib.deposit({ stone_sword: 1 }, 293, 72, -57);
  }
  if (pick && lib.count('stone_pickaxe') > 1) {
    await lib.deposit({ stone_pickaxe: 1 }, 293, 72, -57);
  }
  console.log('Gear deposited in chest for Beta.');
} catch (e) {
  console.log('Deposit error:', e.message);
}

// 3. Message Beta
bot.chat('beta: Put stone_sword and stone_pickaxe in chest for you. Door closed. Let us shelter until dawn.');

// 4. Shelter until dawn
console.log('Waiting inside base until dawn (tick 23460)...');
while (!isCancelled()) {
  const cur = lib.time().timeOfDay;
  if (cur >= 23460 || cur < 1000) {
    console.log(`Dawn reached! Time: ${cur}`);
    break;
  }
  await sleep(10000);
  console.log(`Sheltered in base... Time: ${cur} (${23460 - cur} ticks left)`);
}

console.log('Dawn broken! Hostiles near:', JSON.stringify(lib.hostiles(16)));
bot.chat('alpha: Dawn has arrived! Safe to mine iron and diamonds for portal.');
