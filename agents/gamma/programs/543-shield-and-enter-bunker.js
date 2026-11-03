// programs/543-shield-and-enter-bunker.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 543: SHIELD DEFENSE & RETREAT TO BUNKER ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Immediately raise shield
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}
bot.activateItem(true); // 100% block against Hoglin charge

// Step 2: Face nearest hostile (Hoglin) to block knockback
const hoglin = Object.values(bot.entities).find(e =>
  e.isValid && e.name === 'hoglin' && bot.entity.position.distanceTo(e.position) <= 6
);
if (hoglin) {
  console.log(`Blocking Hoglin at ${lib.fmt(hoglin.position)} with active shield!`);
  await bot.lookAt(hoglin.position.offset(0, 1.0, 0), true);
  bot.activateItem(true);
}

// Step 3: Fast retreat into Fortress Workshop Bunker at (44, 65, -127)
console.log('Retreating into Fortress Workshop Bunker at (44, 65, -127)...');
bot.chat('gamma: Hoglin encountered! Shielding and retreating into 2-high bunker doorway at (44, 65, -127)!');

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -128));
} catch (e) {
  try {
    await lib.goTo(44, 65, -128, 1.2, { dig: false, timeoutMs: 8000 });
  } catch (e2) {
    await bot.lookAt(new Vec3(44.5, 66.0, -127.5), true);
    bot.setControlState('forward', true);
    await sleep(1000);
    bot.setControlState('forward', false);
  }
}

bot.clearControlStates();
bot.activateItem(true);

console.log('Position inside bunker:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// Step 4: If Hoglin is at the 2-high doorway, slay it safely through the slit
const doorHoglin = Object.values(bot.entities).find(e =>
  e.isValid && e.name === 'hoglin' && bot.entity.position.distanceTo(e.position) <= 4.0
);

if (doorHoglin) {
  console.log('Slaying Hoglin safely through 2-high bunker doorway!');
  const pickWeapon = bot.inventory.items().find(i => i.name === 'iron_sword') ||
                     bot.inventory.items().find(i => i.name.includes('sword'));
  if (pickWeapon) await bot.equip(pickWeapon, 'hand');

  const startCombat = Date.now();
  while (Date.now() - startCombat < 8000 && doorHoglin.isValid && !isCancelled()) {
    bot.deactivateItem();
    bot.attack(doorHoglin);
    bot.activateItem(true);
    await sleep(650);
  }
  await sleep(500);
  await lib.pickup(4.0);
  console.log('Hoglin defeated! Inventory:', lib.inv());
}

// Step 5: Check if raw porkchop was picked up and eat if hungry
const pork = bot.inventory.items().find(i => i.name === 'porkchop' || i.name === 'cooked_porkchop');
if (pork && bot.food < 18) {
  try {
    await bot.equip(pork, 'hand');
    bot.activateItem();
    await sleep(2000);
    bot.deactivateItem();
    console.log(`Ate porkchop! Food now: ${bot.food}, HP: ${bot.health}`);
  } catch (e) {}
}

bot.chat(`gamma: Secure inside Fortress Bunker (${lib.fmt(bot.entity.position)})! HP: ${bot.health.toFixed(1)}/20, Food: ${bot.food}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
