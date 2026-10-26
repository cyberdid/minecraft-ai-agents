// programs/446-gear-up-tools-and-stone.js
console.log('=== Program 446: Fast Gear-Up: Tools & Cobblestone ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check time until night
const t = lib.time();
console.log(`Current time: ${t.timeOfDay}, seconds until night: ${t.secondsUntilNight}`);
if (t.secondsUntilNight < 100 && t.secondsUntilNight > 0) {
  console.log('Too close to nightfall, remaining in shelter');
  return;
}

// 2. Step outside base
console.log('Stepping out of base...');
try {
  await passDoorOut();
} catch (err) {
  console.log('passDoorOut note:', err.message);
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
}
console.log('Outside base at:', lib.fmt(bot.entity.position));

// 3. Collect 4-6 logs
console.log('Collecting logs...');
try {
  const woodResult = await lib.collect('*_log', 4);
  console.log('Wood collected:', JSON.stringify(woodResult));
} catch (err) {
  console.log('Wood collect error:', err.message);
}

// 4. Craft planks
const logCount = lib.count('*_log');
if (logCount > 0) {
  try {
    const logs = bot.inventory.items().filter(i => i.name.endsWith('_log'));
    for (const l of logs) {
      const plankType = l.name.replace('_log', '_planks');
      await lib.craft(plankType, l.count * 4);
    }
  } catch (err) {
    console.log('Plank craft note:', err.message);
  }
}
console.log('Inventory after wood crafting:', JSON.stringify(lib.inv()));

// 5. Ensure wooden pickaxe if no pickaxe held
if (lib.count('*_pickaxe') === 0) {
  console.log('Crafting wooden pickaxe...');
  if (lib.count('stick') < 2) {
    await lib.craft('stick', 4);
  }
  const plankName = bot.inventory.items().find(i => i.name.endsWith('_planks'))?.name || 'oak_planks';
  try {
    await lib.craft('wooden_pickaxe', 1);
  } catch (err) {
    console.log('Wooden pickaxe craft note:', err.message);
  }
}

// 6. Mine stone to get cobblestone
console.log('Mining stone for cobblestone...');
try {
  // First get 3 cobblestone for a stone pickaxe
  if (lib.count('stone_pickaxe') === 0) {
    await lib.collect('cobblestone', 3);
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone pickaxe!');
  }
  
  // Now gather 32 cobblestone with the stone pickaxe
  const cobbleNeeded = Math.max(0, 32 - lib.count('cobblestone'));
  if (cobbleNeeded > 0) {
    console.log(`Collecting ${cobbleNeeded} more cobblestone...`);
    await lib.collect('cobblestone', cobbleNeeded);
  }
} catch (err) {
  console.log('Cobblestone mining error:', err.message);
}

// 7. Craft spare stone pickaxe and stone sword
try {
  if (lib.count('stick') < 4) await lib.craft('stick', 4);
  if (lib.count('stone_pickaxe') < 2) {
    await lib.craft('stone_pickaxe', 1);
  }
  if (lib.count('stone_sword') === 0) {
    await lib.craft('stone_sword', 1);
  }
} catch (err) {
  console.log('Weapon/tool craft note:', err.message);
}

// 8. Equip best weapon
await lib.equipWeapon();

console.log('Alpha status after gear up:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.chat(`team: Alpha geared up! Tools: ${JSON.stringify(lib.tools())}, Cobble: ${lib.count('cobblestone')}. Ready for Nether!`);
