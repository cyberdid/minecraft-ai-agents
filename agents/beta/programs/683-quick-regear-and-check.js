// programs/683-quick-regear-and-check.js
console.log('=== Program 683: Status Check & Quick Regear ===');
console.log('Bot:', bot.username, 'Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
console.log('Players online:', Object.keys(bot.players).join(', '));
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p.entity) {
    console.log(`Player ${name} at:`, lib.fmt(p.entity.position));
  }
}

// Check base chest at 293, 72, -57 if close
const chestBlock = bot.findBlock({ matching: mcData.blocksByName.chest.id, maxDistance: 16 });
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    console.log('Chest items:', chest.items().map(i => `${i.name}x${i.count}`).join(', '));
    // If there is armor or food, take what we need
    for (const item of chest.items()) {
      if (item.name.includes('helmet') || item.name.includes('chestplate') || item.name.includes('leggings') || item.name.includes('boots') || item.name === 'shield') {
        await chest.withdraw(item.type, null, item.count);
      } else if (item.name.includes('cooked') || item.name.includes('bread') || item.name.includes('apple')) {
        await chest.withdraw(item.type, null, Math.min(item.count, 16));
      } else if (item.name.includes('pickaxe') || item.name.includes('sword')) {
        await chest.withdraw(item.type, null, 1);
      } else if (item.name === 'cobblestone' && lib.count('cobblestone') < 32) {
        await chest.withdraw(item.type, null, Math.min(item.count, 32 - lib.count('cobblestone')));
      }
    }
    await chest.close();
  } catch (e) {
    console.log('Chest access error:', e.message);
  }
}

// Run quickRegear
console.log('Running quickRegear...');
const res = await quickRegear({ cobble: 16 });
console.log('Regear result:', JSON.stringify(res));
console.log('Final inv:', JSON.stringify(lib.inv()));
