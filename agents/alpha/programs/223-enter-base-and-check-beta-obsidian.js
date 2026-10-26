// programs/223-enter-base-and-check-beta-obsidian.js
console.log('=== Program 223: Enter Base & Coordinate Obsidian with Beta ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight);

// 1. Move to base entrance and enter
try {
  await lib.goTo(294, 72, -52, 1, { timeoutMs: 20000 });
  if (typeof passDoorIn === 'function') await passDoorIn();
  else await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Enter base note:', e.message);
  try { await lib.goNearBlock(295, 72, -56); } catch (e2) {}
}

// 2. Craft stone tools using base crafting table
try {
  if (lib.count('stick') < 4 && lib.count('birch_planks') >= 2) {
    await lib.craft('stick', 4);
  }
  if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe crafted!');
  }
  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  }
} catch (e) {
  console.log('Craft tools note:', e.message);
}

// 3. Check Beta
if (bot.players.beta) {
  const b = bot.players.beta.entity;
  console.log('Beta pos:', b ? lib.fmt(b.position) : 'unknown', 'held:', b?.heldItem?.name);
}

// 4. Chat with Beta
bot.chat('beta: Alpha inside base. Beta holding diamond_pickaxe at y=19! Quench lava lake at (286, 18, 8) and gather 10 obsidian for portal frame at (298, 72, -54)!');

// 5. If night arrives and canSleep is true, sleep
if (lib.time().canSleep) {
  console.log('Sleeping...');
  try {
    await lib.sleepInBed();
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

console.log('Alpha inventory:', JSON.stringify(lib.inv()));
console.log('Status:', JSON.stringify(lib.status()));
