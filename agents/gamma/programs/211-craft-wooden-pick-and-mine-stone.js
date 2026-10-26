// programs/211-craft-wooden-pick-and-mine-stone.js
console.log('--- CRAFT WOODEN PICKAXE & MINE STONE BEFORE DUSK ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Craft birch_planks and wooden_pickaxe inside base
console.log('Crafting birch_planks...');
await lib.craft('birch_planks', 8);
console.log('Crafting wooden_pickaxe...');
await lib.craft('wooden_pickaxe', 1);
console.log('Wooden pickaxe crafted!');
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

// 2. Exit door and collect 16 stone on hillside
if (lib.time().secondsUntilNight > 60) {
  console.log('Exiting base door to mine stone...');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    try { await lib.walkTo(294.5, -52.0, 2000); } catch (e2) {}
  }

  console.log('Collecting 16 stone...');
  try {
    await lib.collect('stone', 16);
    console.log('Cobblestone count:', lib.count('cobblestone'));
  } catch (e) {
    console.log('Stone collect note:', e.message);
  }

  // Craft stone tools
  if (lib.count('cobblestone') >= 5) {
    console.log('Crafting stone tools...');
    await lib.craft('stone_pickaxe', 1);
    await lib.craft('stone_sword', 1);
    await lib.equipWeapon();
    console.log('Tools now:', JSON.stringify(lib.tools()));
  }

  // Return to base before dusk
  console.log('Returning inside base...');
  try {
    await lib.goTo(294, 72, -53, 1, { timeoutMs: 12000 });
  } catch (e) {
    await lib.goToXZ(294, -53, { timeoutMs: 8000 });
  }

  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
  try { await lib.door(294, 72, -54, false); } catch (e) {}
}

// 3. Set spawn and attempt sleep if night
console.log('Inside base!');
try { await lib.setSpawn(); } catch (e) {}

if (lib.time().canSleep) {
  try {
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Final HP:', bot.health, 'Food:', bot.food);

bot.chat(`gamma armed with stone tools & ${lib.count('cobblestone')} cobble inside base! Ready for team night sleep.`);
