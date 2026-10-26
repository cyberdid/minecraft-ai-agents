// programs/404-base-expedition-outfitting.js
console.log('=== Program 404: Base Expedition Outfitting for Blaze Spawner ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Walk into base shelter at (294, 72, -54)
console.log('Walking into base shelter...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 15000 });
  await globalThis.passDoorIn();
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 2. Check base chest at (293, 72, -57)
let chest = {};
try {
  chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest items:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest error:', e.message);
}

// 3. Obtain stone_pickaxe x2 and stone_sword
console.log('Obtaining stone_pickaxe x2...');
try {
  await lib.obtain('stone_pickaxe', 2);
} catch (e) {
  console.log('Pickaxe obtain note:', e.message);
}

console.log('Obtaining stone_sword...');
try {
  await lib.obtain('stone_sword', 1);
} catch (e) {
  console.log('Sword obtain note:', e.message);
}

// 4. Collect 32 cobblestone for Blaze Spawner fortifications
console.log('Collecting 32 cobblestone...');
try {
  await lib.collect('cobblestone', 32);
} catch (e) {
  console.log('Cobble collect note:', e.message);
}

// 5. Check if we have iron for a shield
if (lib.count('shield') === 0) {
  try {
    if (chest['iron_ingot'] && chest['iron_ingot'] >= 1) {
      await lib.withdraw({ iron_ingot: 1 }, 293, 72, -57);
      if (lib.count('*_planks') < 6 && lib.count('*_log') > 0) {
        await lib.craft('oak_planks', 4);
      }
      if (lib.count('*_planks') >= 6) {
        await lib.craft('shield', 1);
        console.log('Shield crafted from chest iron!');
      }
    }
  } catch (e) {}
}

// 6. Obtain food (hunt 3 cows/pigs)
if (lib.count('cooked_*') < 4) {
  console.log('Hunting animals for food...');
  try {
    await lib.obtain('cooked_beef', 4);
  } catch (e) {
    console.log('Food obtain note:', e.message);
  }
}

// 7. Equip gear
await lib.equipArmor();
await lib.equipWeapon();

bot.chat(`team: Alpha expedition outfitting complete! Tools: ${JSON.stringify(lib.tools())}, Cobble: ${lib.count('cobblestone')}, Food: ${lib.count('cooked_*')}. Heading to Nether portal for Blaze Spawner at (32, 68, -190)!`);

console.log('Alpha inventory:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
