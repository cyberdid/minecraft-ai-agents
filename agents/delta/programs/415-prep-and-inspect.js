// programs/415-prep-and-inspect.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
  } else {
    console.log(`Player ${name} (not nearby or different dim)`);
  }
}

// Check base chest if accessible
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Chest (293, 72, -57) contents:', JSON.stringify(contents));
  // If chest has items we want, withdraw food, armor, iron tools
  const toWithdraw = {};
  for (const item of ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple', 'iron_sword', 'stone_sword', 'shield', 'iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots', 'golden_boots', 'golden_helmet', 'torch']) {
    if (contents[item]) {
      toWithdraw[item] = contents[item];
    }
  }
  if (Object.keys(toWithdraw).length > 0) {
    console.log('Withdrawing from chest:', JSON.stringify(toWithdraw));
    await lib.withdraw(toWithdraw, 293, 72, -57);
  }
} catch (e) {
  console.log('Chest check failed:', e.message);
}

// Quick regear helper
console.log('Running quickRegear...');
const regearResult = await quickRegear({ cobble: 16 });
console.log('quickRegear result:', JSON.stringify(regearResult));

// Equip armor & weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('Delta inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
console.log('Offhand:', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name);
