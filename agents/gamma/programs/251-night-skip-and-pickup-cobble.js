// programs/251-night-skip-and-pickup-cobble.js
console.log('=== NIGHT PROTOCOL, SLEEP & PICKUP COBBLESTONE LEDGE ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Ensure door is closed and set spawn
try { await lib.door(294, 72, -54, false); } catch (e) {}
try { await lib.setSpawn(); } catch (e) {}

// 2. Wait for canSleep
console.log('Waiting for canSleep (tick 12542)...');
while (!isCancelled() && !lib.time().canSleep) {
  await sleep(1000);
}

if (lib.time().canSleep) {
  console.log('Sleeping in bed...');
  bot.chat('gamma sleeping in base bed to skip night! Team sleep too!');
  try {
    await lib.sleepInBed();
    while (!isCancelled() && bot.isSleeping) {
      await sleep(1000);
    }
    console.log('Morning arrived! Time:', JSON.stringify(lib.time()));
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

// 3. Step out door to pickup cobblestone on ledge
console.log('Stepping outside door to pickup dropped cobblestone...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(294.5, -52.0, 3000); } catch (e2) {}
}

// Walk over to the ledge at (298, 68, -55) and pickup items
console.log('Approaching cobblestone drop ledge at (298, 68, -55)...');
try {
  await lib.goTo(298, 68, -55, 2, { timeoutMs: 12000 });
} catch (e) {
  console.log('goTo ledge note:', e.message);
  try { await lib.goToXZ(298, -55, { timeoutMs: 8000 }); } catch (e2) {}
}

const picked = await lib.pickup(12);
console.log(`Picked up ${picked} items on ledge!`);

// 4. Return to base crafting table
console.log('Returning to base crafting table...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 10000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(295.5, -55.5, 3000); } catch (e2) {}
}

// Ensure door closed
try { await lib.door(294, 72, -54, false); } catch (e) {}

console.log('=== STATUS AT BASE ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Cobblestone count:', lib.count('cobblestone'));
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.chat(`gamma base resupply: cobble x${lib.count('cobblestone')}, wood x${lib.count('*_planks')}, HP ${bot.health}/20`);
