// programs/159-enter-base-craft-stone-tools.js
console.log('--- Re-equipping at Base ---');
console.log('Starting pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Walk up to base entrance on surface
console.log('Pathing to base entrance (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1);
  console.log('At base entrance!');
} catch (e) {
  console.log('goTo error:', e.message);
  // fallback goToXZ
  await lib.goToXZ(294, -53);
}

// 2. Open door and step inside base
const doorBlk = bot.blockAt(new Vec3(294, 72, -54));
if (doorBlk) {
  try {
    if (!doorBlk.getProperties().open) {
      await bot.activateBlock(doorBlk);
      await sleep(200);
    }
    await lib.walkTo(293.5, -56.0, 3000);
    const doorAfter = bot.blockAt(new Vec3(294, 72, -54));
    if (doorAfter && doorAfter.getProperties().open) {
      await bot.activateBlock(doorAfter);
    }
    console.log('Safely inside base!');
  } catch (e) {
    console.log('Door passage error:', e.message);
  }
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Withdraw 32 cobblestone from chest
try {
  console.log('Withdrawing 32 cobblestone from chest...');
  await lib.withdraw({ cobblestone: 32 }, 293, 72, -57);
} catch (e) {
  console.log('Chest withdraw error:', e.message);
}

// 4. Collect 2 logs for wood/sticks
console.log('Collecting 2 logs outside for tools...');
try {
  // Step out
  const d = bot.blockAt(new Vec3(294, 72, -54));
  if (d && !d.getProperties().open) await bot.activateBlock(d);
  await lib.walkTo(294.5, -52.0, 3000);
  if (d && d.getProperties().open) await bot.activateBlock(d);
  
  await lib.collect('*_log', 2);
  
  // Return to base
  await lib.goTo(294, 72, -53, 1);
  const d2 = bot.blockAt(new Vec3(294, 72, -54));
  if (d2 && !d2.getProperties().open) await bot.activateBlock(d2);
  await lib.walkTo(293.5, -56.0, 3000);
  if (d2 && d2.getProperties().open) await bot.activateBlock(d2);
} catch (e) {
  console.log('Wood collection note:', e.message);
}

// 5. Craft planks, sticks, stone tools
console.log('Crafting stone tools...');
try {
  const logItem = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
  if (logItem) {
    const plankName = logItem.replace('_log', '_planks');
    await lib.craft(plankName, 8);
  }
  if (lib.count('*_planks') > 0 && lib.count('stick') < 4) {
    await lib.craft('stick', 8);
  }
  if (lib.count('cobblestone') >= 8 && lib.count('stick') >= 4) {
    await lib.craft('stone_pickaxe', 1);
    await lib.craft('stone_sword', 1);
    await lib.craft('stone_axe', 1);
    console.log('Crafted stone_pickaxe, stone_sword, stone_axe!');
  }
} catch (e) {
  console.log('Crafting note:', e.message);
}

await lib.equipWeapon();
console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final pos:', lib.fmt(bot.entity.position));
bot.chat('alpha: Re-equipped with stone tools at base. Ready for surface iron mining.');
