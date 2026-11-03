// programs/715-craft-tools-sleep-dawn-and-warp.js
console.log('=== Program 715: Regear Tools, Sleep Dawn & Warp to Nether ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain active shield in offhand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

// 2. Withdraw logs from Base Chest to craft fresh tools
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    for (const item of chest.containerItems()) {
      if (item.name === 'birch_log' || item.name === 'oak_log') {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.name} x${item.count}`);
      }
    }
    chest.close();
  } catch (e) {}
}

// Convert logs to planks
const log = bot.inventory.items().find(i => i.name.includes('_log'));
if (log) {
  try {
    await lib.craft('oak_planks', 1);
  } catch (e) {
    try { await lib.craft('birch_planks', 1); } catch (e2) {}
  }
}

// Craft sticks if low
if (lib.count('stick') < 4) {
  try { await lib.craft('stick', 1); } catch (e) {}
}

// Craft fresh stone_pickaxe and stone_sword
try {
  await lib.craft('stone_pickaxe', 1);
  console.log('Crafted fresh stone_pickaxe!');
} catch (e) {}

try {
  await lib.craft('stone_sword', 1);
  console.log('Crafted fresh stone_sword!');
} catch (e) {}

console.log('Tools crafted. Inv:', lib.inv());

// 3. Sleep in bed to reset HP & Food
console.log('Checking time for sleep... Night in:', lib.time().secondsUntilNight, 'canSleep:', lib.time().canSleep);
const sleepWaitStart = Date.now();
while (!lib.time().canSleep && Date.now() - sleepWaitStart < 180000 && !checkCancelled()) {
  const sec = lib.time().secondsUntilNight;
  if (sec <= 5 || lib.time().canSleep) break;
  await sleep(3000);
}

if (lib.time().canSleep) {
  console.log('Night reached! Sleeping in base bed (294, 72, -55)...');
  try {
    await lib.sleepInBed();
    console.log('Woke up! HP:', bot.health, 'Food:', bot.food);
    bot.chat(`alpha: Slept and reset to full health! HP: ${bot.health}/20, Food: ${bot.food}/20.`);
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

// 4. Warp into Nether
console.log('Exiting base and entering Nether Portal...');
bot.chat('alpha: Entering Nether with full gear and 2 gold ingots to pool with Gamma for golden_boots!');
await globalThis.enterNetherPortal();

console.log('Dimension now:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.activateItem(true);
  globalThis.configureFireAvoidance();

  // Walk into bunker at (41, 65, -6)
  try {
    await bot.pathfinder.goto(new goals.GoalNear(41.0, 65.0, -6.0, 1.2));
  } catch (e) {
    try { await lib.goTo(41, 65, -6, 1.5, { timeoutMs: 6000 }); } catch (e2) {}
  }

  // Vacuum drops
  await lib.pickup(5.0);

  // Check teammates
  for (const name of ['beta', 'gamma', 'delta']) {
    const p = bot.players[name]?.entity;
    if (p) {
      console.log(`Teammate ${name} at ${lib.fmt(p.position)} (dist ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
    }
  }

  // If Gamma is nearby, toss 1 gold ingot to Gamma so Gamma can craft golden_boots
  const gamma = bot.players['gamma']?.entity;
  if (gamma && bot.entity.position.distanceTo(gamma.position) <= 5.0 && lib.count('gold_ingot') >= 2) {
    const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (ingot) {
      await bot.lookAt(gamma.position.offset(0, 1.0, 0), true);
      try {
        await bot.toss(ingot.type, null, 1);
        bot.chat('alpha: Tossed 1 gold ingot to Gamma! Gamma has 4 ingots for golden_boots!');
      } catch (e) {}
    }
  }

  bot.chat(`alpha: United with team in Nether bunker! HP: ${bot.health}/20, Ingots: ${lib.count('gold_ingot')}, Pearls: ${lib.count('ender_pearl')}/12`);
}

console.log('=== Program 715 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Inv:', lib.inv());
