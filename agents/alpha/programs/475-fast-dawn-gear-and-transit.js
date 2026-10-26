// programs/475-fast-dawn-gear-and-transit.js
console.log('=== Program 475: Dawn Gear-Up & Nether Transit ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Step out of base
console.log('Stepping out of base door...');
try {
  await passDoorOut();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

// 2. Obtain stone_pickaxe via lib.obtain (fast, reliable)
console.log('Obtaining stone_pickaxe...');
try {
  const res = await lib.obtain('stone_pickaxe', 1);
  console.log('Stone pickaxe obtain result:', JSON.stringify(res));
} catch (err) {
  console.log('Pickaxe obtain note:', err.message);
}

// 3. Mine 16 cobblestone & craft stone_sword
if (lib.count('stone_pickaxe') > 0) {
  try {
    const need = Math.max(0, 16 - lib.count('cobblestone'));
    if (need > 0) {
      console.log(`Mining ${need} cobblestone...`);
      await lib.collect('cobblestone', need);
    }
  } catch (e) {
    console.log('Cobblestone collect note:', e.message);
  }

  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
    try {
      if (lib.count('stick') < 1) await lib.craft('stick', 4);
      await lib.craft('stone_sword', 1);
      console.log('Crafted stone_sword!');
    } catch (e) {
      console.log('Sword craft note:', e.message);
    }
  }
}

await lib.equipWeapon();
console.log('Gear equipped:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

// 4. Enter Nether portal at (299, 73, -54)
console.log('Moving into Nether portal frame at (299, 73, -54)...');
try {
  await lib.goTo(299, 72, -53, 1, { timeoutMs: 15000 });
} catch (e) {
  try { await lib.goToXZ(299, -54); } catch (e2) {}
}

try {
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(800);
  bot.setControlState('jump', false);
  await sleep(400);
  bot.setControlState('forward', false);
}

bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 5. Wait for dimension transit
console.log('Waiting stationary inside portal for dimension transit...');
for (let wait = 0; wait < 25; wait++) {
  if (bot.game.dimension === 'the_nether') {
    console.log('*** TRANSIT SUCCESSFUL! ALPHA IS IN THE NETHER! ***');
    break;
  }
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

bot.chat(`team: Alpha armed & transited into the Nether at ${lib.fmt(bot.entity.position)}! Tools: ${JSON.stringify(lib.tools())}, Cobble: ${lib.count('cobblestone')}. Sprinting to Blaze Spawner!`);
