// programs/356-log-base-sleep-and-dawn-gear.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'time:', bot.time.timeOfDay);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Mine 1-2 logs for planks
if (lib.count('*_log') === 0 && lib.count('*_planks') < 3) {
  console.log('Mining 2 logs from nearby tree...');
  try {
    await lib.collect('*_log', 2);
    console.log('Mined logs! Count:', lib.count('*_log'));
  } catch (e) {
    console.log('Collect log note:', e.message);
  }
}

// 2. Return to base at (294, 72, -56)
console.log('Heading into base at (294, 72, -56)...');
try {
  await lib.goTo(294, 72, -56, 1, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo base note:', e.message);
}

// 3. Sleep to skip night if time >= 12000
const t = bot.time.timeOfDay;
console.log(`Current time: ${t}`);
if (t >= 11800 && t <= 23500) {
  while (!isCancelled() && bot.time.timeOfDay < 12542) {
    console.log(`Waiting for sleep tick 12542 (current: ${bot.time.timeOfDay})...`);
    await sleep(1000);
  }
  const bed = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 8, count: 1 })[0];
  if (bed) {
    console.log(`Sleeping in bed at ${lib.fmt(bed)}...`);
    try {
      await bot.sleep(bot.blockAt(bed));
      bot.chat('delta: Sleeping in base bed to skip night!');
      await sleep(5000);
      try { await bot.wake(); } catch (e) {}
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }
}

console.log('Time after sleep check:', bot.time.timeOfDay, 'pos:', lib.fmt(bot.entity.position));

// 4. Craft planks and wooden pickaxe
const logs = bot.inventory.items().filter(i => i.name.endsWith('_log'));
for (const l of logs) {
  try { await lib.craft(l.name.replace('_log', '_planks'), l.count * 4); } catch (e) {}
}
if (lib.count('stick') < 2) {
  try { await lib.craft('stick', 4); } catch (e) {}
}
if (lib.count('*_pickaxe') === 0 && lib.count('*_planks') >= 3) {
  console.log('Crafting wooden_pickaxe...');
  try {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Wooden pickaxe crafted!');
  } catch (e) {
    console.log('Craft wood pick note:', e.message);
  }
}

// 5. Mine 32 cobblestone
if (lib.count('*_pickaxe') > 0 && lib.count('cobblestone') < 32) {
  const needed = 32 - lib.count('cobblestone');
  console.log(`Mining ${needed} cobblestone with pickaxe...`);
  try {
    await lib.collect('cobblestone', needed);
    console.log('Cobblestone count:', lib.count('cobblestone'));
  } catch (e) {
    console.log('Collect cobble note:', e.message);
  }
}

// 6. Craft stone pickaxe and stone sword
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  if (lib.count('stick') < 2) try { await lib.craft('stick', 4); } catch (e) {}
  try { await lib.craft('stone_pickaxe', 1); console.log('Stone pickaxe crafted!'); } catch (e) {}
}
if (lib.count('cobblestone') >= 2 && lib.count('*_sword') === 0) {
  if (lib.count('stick') < 1) try { await lib.craft('stick', 4); } catch (e) {}
  try { await lib.craft('stone_sword', 1); console.log('Stone sword crafted!'); } catch (e) {}
}

try { await lib.equipArmor(); await lib.equipWeapon(); } catch (e) {}

console.log('Final Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

bot.chat(`delta: Dawn gear ready! Cobble: ${lib.count('cobblestone')}, Sword: ${lib.count('*_sword')}, HP: ${bot.health}/20. Entering Nether to fortify Spawner!`);
