// programs/396-rapid-regear-and-quarry.js
console.log('=== RAPID REARM AT BASE ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

bot.chat('gamma: Respawned at base bed with 20 HP / 20 food! Rapidly crafting stone tools & mining cobble.');

// 1. Obtain stone pickaxe (handles wood -> planks -> table -> wooden pick -> stone -> stone pick)
console.log('Obtaining stone_pickaxe...');
try {
  const r = await lib.obtain('stone_pickaxe', 1);
  console.log('Obtained stone_pickaxe! Steps:', r.steps?.join(' -> '));
} catch (e) {
  console.log('obtain stone_pickaxe note:', e.message);
  // Manual fallback: collect 3 logs, craft planks, sticks, table, wooden pick, stone pick
  if (lib.count('*_log') === 0 && lib.count('*_planks') < 4) {
    await lib.collect('*_log', 3);
  }
  const logName = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
  if (logName) {
    const plankType = logName.replace('_log', '_planks');
    await lib.craft(plankType, 8);
  }
  await lib.ensureTable();
  await lib.craft('stick', 4);
  if (lib.count('wooden_pickaxe') === 0 && lib.count('stone_pickaxe') === 0) {
    await lib.craft('wooden_pickaxe', 1);
  }
  await lib.collect('stone', 5);
  await lib.craft('stone_pickaxe', 1);
}

// 2. Craft stone sword
if (lib.count('stone_sword') === 0) {
  console.log('Crafting stone_sword...');
  try {
    if (lib.count('cobblestone') < 2) {
      await lib.collect('stone', 3);
    }
    if (lib.count('stick') < 1) {
      await lib.craft('stick', 4);
    }
    await lib.ensureTable();
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  } catch (e) {
    console.log('Craft stone_sword note:', e.message);
  }
}

// 3. Mine 24 cobblestone for Nether construction & safety
if (lib.count('cobblestone') < 24) {
  const needed = 24 - lib.count('cobblestone');
  console.log(`Mining ${needed} cobblestone...`);
  try {
    await lib.collect('stone', needed);
    console.log(`Cobblestone collected! Total: ${lib.count('cobblestone')}`);
  } catch (e) {
    console.log('Collect stone note:', e.message);
  }
}

await lib.equipWeapon();
console.log('Ending inventory:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
bot.chat(`gamma: Rearmed! Swords: ${lib.count('stone_sword')}, Pickaxes: ${lib.count('stone_pickaxe')}, Cobble: ${lib.count('cobblestone')}. Ready for Nether!`);
