// programs/453-obtain-stone-gear.js
console.log('=== Program 453: Obtain Stone Gear via lib.obtain ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check time until night
const t = lib.time();
console.log(`Time: ${t.timeOfDay}, seconds until night: ${t.secondsUntilNight}`);
if (t.secondsUntilNight < 90) {
  console.log('Night approaching soon, staying inside base');
  return;
}

// 2. Step outside base
console.log('Stepping outside base...');
try {
  await passDoorOut();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}
console.log('Outside base at:', lib.fmt(bot.entity.position));

// 3. Obtain stone_pickaxe
console.log('Obtaining stone_pickaxe...');
try {
  const res = await lib.obtain('stone_pickaxe', 1);
  console.log('Obtain stone_pickaxe result:', JSON.stringify(res));
} catch (err) {
  console.log('Obtain stone_pickaxe error:', err.message);
}

console.log('Inventory after obtain pickaxe:', JSON.stringify(lib.inv()));

// 4. If we have stone pickaxe, collect 20 cobblestone and craft stone sword
if (lib.count('stone_pickaxe') > 0) {
  try {
    const needCobble = Math.max(0, 20 - lib.count('cobblestone'));
    if (needCobble > 0) {
      console.log(`Collecting ${needCobble} cobblestone...`);
      await lib.collect('cobblestone', needCobble);
    }
  } catch (err) {
    console.log('Cobblestone collect note:', err.message);
  }

  if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
    try {
      if (lib.count('stick') < 1) await lib.craft('stick', 4);
      await lib.craft('stone_sword', 1);
      console.log('Crafted stone_sword!');
    } catch (err) {
      console.log('Sword craft note:', err.message);
    }
  }
}

// 5. Check time and return to base
console.log('Returning to base shelter...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
  await passDoorIn();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

await lib.equipWeapon();
await lib.equipArmor();

console.log('Alpha status:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha ready! Tools: ${JSON.stringify(lib.tools())}, Cobble: ${lib.count('cobblestone')}`);
