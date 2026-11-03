// programs/355-gear-up-and-prepare-spawner-box.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'time:', bot.time.timeOfDay);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 1. Pick up any ground drops nearby
try {
  const drops = await lib.pickup(16);
  console.log('Ground pickups:', drops);
} catch (e) {}

// 2. Obtain stone_pickaxe
console.log('Obtaining stone_pickaxe...');
try {
  const r = await lib.obtain('stone_pickaxe', 1);
  console.log('Obtained stone_pickaxe! Steps:', r.steps.length);
} catch (e) {
  console.log('Obtain stone_pickaxe note:', e.message);
}

// 3. Mine 32 cobblestone for corridor walls & spawner enclosure
console.log('Collecting 32 cobblestone...');
try {
  await lib.collect('cobblestone', 32);
  console.log('Cobblestone count:', lib.count('cobblestone'));
} catch (e) {
  console.log('Collect cobblestone note:', e.message);
}

// 4. Obtain stone_sword
if (lib.count('*_sword') === 0) {
  console.log('Crafting stone_sword...');
  try {
    if (lib.count('stick') < 1) {
      if (lib.count('*_planks') < 2) {
        const l = bot.inventory.items().find(i => i.name.endsWith('_log'));
        if (l) await lib.craft(l.name.replace('_log', '_planks'), 4);
      }
      await lib.craft('stick', 4);
    }
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  } catch (e) {
    console.log('Craft sword note:', e.message);
  }
}

// 5. Try to obtain shield if raw iron is nearby
if (bot.inventory.slots[45]?.name !== 'shield' && lib.count('shield') === 0) {
  console.log('Obtaining shield...');
  try {
    await lib.obtain('shield', 1);
    console.log('Shield obtained!');
  } catch (e) {
    console.log('Obtain shield note:', e.message);
  }
}

// 6. Equip armor, shield in offhand, sword in main hand
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Lock shield in offhand if in inventory
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield) {
  try { await bot.equip(shield, 'off-hand'); console.log('Shield in off-hand!'); } catch (e) {}
}

console.log('Rearmed Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
console.log('Offhand:', bot.inventory.slots[45]?.name);
console.log('Cobblestone count:', lib.count('cobblestone'));

bot.chat(`delta: Re-armed! Cobble: ${lib.count('cobblestone')}, Offhand: ${bot.inventory.slots[45]?.name || 'none'}, Sword: ${lib.count('*_sword')}. Ready for Nether transit!`);
