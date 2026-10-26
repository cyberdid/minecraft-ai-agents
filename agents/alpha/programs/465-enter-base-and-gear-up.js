// programs/465-enter-base-and-gear-up.js
console.log('=== Program 465: Enter Base, Set Spawn & Gear Up ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Enter base
console.log('Entering base...');
try {
  await passDoorIn();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {
    try { await lib.goTo(294, 72, -55, 1); } catch (e3) {}
  }
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 2. Set spawn at bed
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
} catch (e) {
  console.log('Set spawn note:', e.message);
}

// 3. Inspect base chest
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(contents));
  const toWithdraw = {};
  for (const k of Object.keys(contents)) {
    if (['stone_pickaxe', 'stone_sword', 'wooden_pickaxe', 'iron_pickaxe', 'iron_sword', 'shield', 'cobblestone', 'oak_planks', 'birch_planks', 'stick', 'cooked_porkchop', 'bread'].includes(k)) {
      toWithdraw[k] = contents[k];
    }
  }
  if (Object.keys(toWithdraw).length > 0) {
    console.log('Withdrawing from chest:', JSON.stringify(toWithdraw));
    await lib.withdraw(toWithdraw, 293, 72, -57);
  }
} catch (err) {
  console.log('Chest error:', err.message);
}

console.log('Alpha inventory after chest:', JSON.stringify(lib.inv()));

// 4. Obtain stone pickaxe if not held
if (lib.count('*_pickaxe') === 0) {
  console.log('Obtaining stone_pickaxe via lib.obtain...');
  try {
    await passDoorOut();
    const res = await lib.obtain('stone_pickaxe', 1);
    console.log('Obtain stone_pickaxe result:', JSON.stringify(res));
  } catch (err) {
    console.log('Obtain pickaxe error:', err.message);
  }
}

// 5. Mine 16 cobblestone and craft stone_sword
if (lib.count('stone_pickaxe') > 0) {
  try {
    const need = Math.max(0, 16 - lib.count('cobblestone'));
    if (need > 0) {
      console.log(`Mining ${need} cobblestone...`);
      await lib.collect('cobblestone', need);
    }
  } catch (e) {
    console.log('Collect cobble note:', e.message);
  }

  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
    try {
      if (lib.count('stick') < 1) await lib.craft('stick', 4);
      await lib.craft('stone_sword', 1);
      console.log('Crafted stone_sword!');
    } catch (e) {}
  }
}

// 6. Return into base
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
  await passDoorIn();
} catch (e) {}

await lib.equipWeapon();
await lib.equipArmor();

console.log('Alpha ready status:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha ready at base! HP: ${bot.health}, Food: ${bot.food}, Gear: ${JSON.stringify(lib.tools())}, Cobble: ${lib.count('cobblestone')}`);
