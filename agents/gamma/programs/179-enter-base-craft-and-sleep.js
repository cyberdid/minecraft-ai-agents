// programs/179-enter-base-craft-and-sleep.js
console.log('--- ENTER BASE, CRAFT STONE GEAR & SLEEP ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Walk into base through door (294, 72, -54)
console.log('Entering base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 10000 });
} catch (e) {
  try { await lib.walkTo(294.5, -53.5, 4000); } catch (e2) {}
}

try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    const d = bot.blockAt(new Vec3(294, 72, -54));
    if (d) await bot.activateBlock(d);
    await lib.walkTo(293.5, -55.5, 3000);
  } catch (e2) {}
}

// Close door
try { await lib.door(294, 72, -54, false); } catch (e) {}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 2. Craft stone tools (we have 8 cobblestone + 2 sticks + 7 planks)
console.log('Crafting stone tools inside base...');
try {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
    await lib.craft('stone_pickaxe', 1);
  }
  if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
    await lib.craft('stone_sword', 1);
    await lib.equipWeapon();
  }
} catch (e) {
  console.log('Craft note:', e.message);
}

// 3. Set spawn & Sleep in bed
console.log('Setting spawn and waiting for sleep time (12542)...');
try { await lib.setSpawn(); } catch (e) {}

while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  await sleep(400);
}

console.log('Sleeping in bed...');
bot.chat('Gamma is in bed inside base! Sleeping to skip night with Beta & Delta.');
try {
  await lib.sleepInBed();
  console.log('SLEPT IN BED!');
} catch (e) {
  console.log('Sleep note:', e.message);
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Final time:', JSON.stringify(lib.time()));
console.log('Final HP:', bot.health, 'Food:', bot.food);
