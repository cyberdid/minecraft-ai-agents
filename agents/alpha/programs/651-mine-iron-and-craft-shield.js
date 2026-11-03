// programs/651-mine-iron-and-craft-shield.js
console.log('=== Program 651: Mine Iron Ore & Finish Shield ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Step 1: Mine iron ore right next to us at (292, 53, -26)
console.log('Scanning for iron ore within 8 blocks...');
const ironOre = bot.findBlocks({ matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'), maxDistance: 8 });
console.log(`Found ${ironOre.length} iron ore blocks nearby.`);

for (const p of ironOre) {
  if (lib.count('raw_iron') >= 1) break;
  console.log('Mining iron ore at', lib.fmt(p));
  try {
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(3);
  } catch (err) {
    console.log('Dig error:', err.message);
  }
}
console.log('raw_iron in inventory:', lib.count('raw_iron'));

// Step 2: Ascend back to surface base (293, 72, -55)
console.log('Ascending to base (293, 72, -55)...');
try {
  await lib.goTo(293, 72, -55, 2, { timeoutMs: 25000 });
} catch (err) {
  console.log('goTo base failed, using dig/tower:', err.message);
  try { await lib.goTo(293, 72, -55, 2, { dig: true, timeoutMs: 30000 }); } catch (e2) {}
}
console.log('At pos:', lib.fmt(bot.entity.position));

// Step 3: Smelt raw_iron in furnace
if (lib.count('raw_iron') > 0 && lib.count('iron_ingot') === 0) {
  console.log('Smelting raw_iron in base furnace...');
  try {
    await lib.smelt('raw_iron', 'stick', 1);
    console.log('Smelt complete! iron_ingot:', lib.count('iron_ingot'));
  } catch (err) {
    console.log('Smelt note:', err.message);
  }
}

// Step 4: Gather 2 logs from surface trees for planks
if (lib.count('*_planks') < 6) {
  console.log('Searching for nearest surface logs...');
  const logs = bot.findBlocks({ matching: b => b && b.name.includes('_log'), maxDistance: 48, count: 5 });
  console.log(`Found ${logs.length} logs nearby.`);
  if (logs.length > 0) {
    try {
      await lib.dig(logs[0].x, logs[0].y, logs[0].z);
      await lib.pickup(4);
      if (logs[1]) {
        await lib.dig(logs[1].x, logs[1].y, logs[1].z);
        await lib.pickup(4);
      }
      await lib.craft('oak_planks', 8);
      console.log('Planks crafted! Total:', lib.count('*_planks'));
    } catch (e) {
      console.log('Log gather note:', e.message);
    }
  }
}

// Step 5: Craft shield
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield...');
  try {
    await lib.craft('shield', 1);
    console.log('SHIELD CRAFTED SUCCESSFULLY!');
  } catch (err) {
    console.log('Craft shield error:', err.message);
  }
}

// Step 6: Equip shield in offhand and weapon
try {
  await lib.equipArmor();
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) {
    await bot.equip(shield, 'off-hand');
    console.log('Shield equipped in offhand!');
  }
} catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

const offhand = bot.inventory.slots[45];
console.log('Offhand slot 45:', offhand?.name, 'Held:', bot.heldItem?.name);
if (offhand?.name === 'shield') {
  bot.chat('alpha: Shield equipped in off-hand! Full fireball immunity active!');
}

console.log('=== Program 651 Complete ===');
console.log('Final inv:', lib.inv(), 'HP:', bot.health, 'dim:', bot.game.dimension);
