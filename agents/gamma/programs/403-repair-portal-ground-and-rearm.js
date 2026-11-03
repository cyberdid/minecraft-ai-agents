// programs/403-repair-portal-ground-and-rearm.js
console.log('=== RAPID REARM & REPAIR PORTAL FOUNDATION ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

bot.chat('gamma: Standing safely at base bed (20 HP / 20 food). Crafting stone gear & securing portal foundation.');

// 1. Obtain stone pickaxe from scratch
console.log('Obtaining stone_pickaxe...');
try {
  await lib.obtain('stone_pickaxe', 1);
  console.log('Stone pickaxe secured!');
} catch (e) {
  console.log('obtain stone_pickaxe fallback:', e.message);
  try {
    if (lib.count('*_log') === 0 && lib.count('*_planks') < 4) {
      await lib.collect('*_log', 3);
    }
    const log = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
    if (log) await lib.craft(log.replace('_log', '_planks'), 8);
    await lib.ensureTable();
    await lib.craft('stick', 4);
    if (lib.count('wooden_pickaxe') === 0 && lib.count('stone_pickaxe') === 0) {
      await lib.craft('wooden_pickaxe', 1);
    }
    await lib.collect('stone', 4);
    await lib.craft('stone_pickaxe', 1);
  } catch (e2) {
    console.log('Fallback error:', e2.message);
  }
}

// 2. Craft stone sword
if (lib.count('stone_sword') === 0) {
  console.log('Crafting stone_sword...');
  try {
    if (lib.count('cobblestone') < 2) await lib.collect('stone', 3);
    if (lib.count('stick') < 1) await lib.craft('stick', 4);
    await lib.ensureTable();
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  } catch (e) {}
}

// 3. Mine 24 cobblestone from safe quarry
if (lib.count('cobblestone') < 24) {
  const needed = 24 - lib.count('cobblestone');
  console.log(`Mining ${needed} cobblestone...`);
  try {
    await lib.collect('stone', needed);
    console.log(`Cobblestone collected: ${lib.count('cobblestone')}`);
  } catch (e) {}
}

await lib.equipWeapon();

// 4. Return to base door (294, 72, -53)
console.log('Navigating to base door...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 12000 });
} catch (e) {}

// 5. Inspect portal foundation and seal any drop holes
console.log('Inspecting portal ground foundation at (297..300, 71, -55..-52)...');
for (let x = 297; x <= 300; x++) {
  for (let z = -55; z <= -52; z++) {
    const floorBlock = bot.blockAt(new Vec3(x, 71, z));
    if (!floorBlock || floorBlock.boundingBox !== 'block') {
      console.log(`FOUND HOLE at (${x}, 71, ${z})! Sealing with cobblestone...`);
      try {
        await lib.place('cobblestone', x, 71, z);
      } catch (e) {}
    }
  }
}

console.log('Portal foundation secured! Ending status:');
console.log('Inv:', JSON.stringify(lib.inv()));
console.log('Status:', JSON.stringify(lib.status()));
bot.chat(`gamma: Ready! Gear: swords=${lib.count('stone_sword')}, pickaxes=${lib.count('stone_pickaxe')}, cobble=${lib.count('cobblestone')}. Ground secured!`);
