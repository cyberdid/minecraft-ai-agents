// programs/726-craft-shield-for-delta-and-sleep.js
console.log('=== Program 726: Craft Shield for Delta and Sleep to Reset Stats ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Craft birch_planks from birch_log
if (lib.count('birch_log') > 0) {
  try {
    await lib.craft('birch_planks', lib.count('birch_log') * 4);
    console.log(`Crafted birch_planks! Total planks: ${lib.count('*_planks')}`);
  } catch (e) {
    console.log('Planks craft note:', e.message);
  }
}

// 2. Craft shield for Delta if we have iron_ingot and planks
const ironIngots = lib.count('iron_ingot');
const planks = lib.count('*_planks');
console.log(`Resources for shield: iron_ingot = ${ironIngots}, planks = ${planks}`);

if (ironIngots >= 1 && planks >= 6) {
  try {
    console.log('Crafting shield for Delta at Base Crafting Table (295, 72, -56)...');
    await lib.craft('shield', 1);
    console.log('Shield successfully crafted!');
    bot.chat('alpha: Crafted a shield for Delta!');
  } catch (e) {
    console.log('Shield crafting note:', e.message);
  }
}

// 3. Toss shield to Delta if Delta is inside base
const delta = Object.values(bot.entities).find(e => e.type === 'player' && e.username === 'delta');
if (delta) {
  const shield = bot.inventory.items().find(i => i.name === 'shield' && i.slot !== 45);
  // If no spare in inventory slots, check if we have one to toss
  if (shield) {
    console.log(`Tossing shield to Delta at ${lib.fmt(delta.position)}...`);
    await bot.lookAt(delta.position.offset(0, 1.2, 0), true);
    await bot.toss(shield.type, null, 1);
    bot.chat('alpha: delta: Here is a brand new shield! Equip it in offhand (`slot 45`)!');
  } else {
    // If shield is in offhand and we just crafted another, check offhand
    const allShields = bot.inventory.items().filter(i => i.name === 'shield');
    console.log(`Total shields on Alpha: ${allShields.length}, offhand: ${bot.inventory.slots[45]?.name}`);
    if (allShields.length > 1) {
      const spare = allShields.find(s => s.slot !== 45);
      if (spare) {
        await bot.lookAt(delta.position.offset(0, 1.2, 0), true);
        await bot.toss(spare.type, null, 1);
        bot.chat('alpha: delta: Tossed spare shield to you!');
      }
    }
  }
} else {
  console.log('Delta entity not currently found in base render distance');
}

// 4. Wait for night and sleep
console.log(`Time status: night in ${lib.time().nightIn}s, canSleep: ${lib.time().canSleep}`);
bot.chat(`alpha: Base Bed ready at (294, 72, -55). Night in ${lib.time().nightIn}s! Delta & Beta, stand by beds to sleep together at dusk!`);

const startWait = Date.now();
while (!checkCancelled() && !lib.time().canSleep && Date.now() - startWait < 140000) {
  // Check if night falls
  if (lib.time().canSleep) break;
  await sleep(1000);
}

if (lib.time().canSleep) {
  console.log('Night reached! Sleeping in base bed (294, 72, -55)...');
  try {
    await lib.sleepInBed();
    bot.chat('alpha: Slept in bed! Full HP and Food reset to 20/20 at dawn!');
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

return {
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  time: lib.time()
};
