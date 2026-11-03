// programs/440-inspect-and-regear.js
console.log('=== INSPECT & REGEAR (GAMMA) ===');
console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check offhand and equipped armor
console.log('Offhand:', bot.inventory.slots[45]?.name);
console.log('Equipped armor:');
for (let slot = 5; slot <= 8; slot++) {
  console.log(` Slot ${slot}:`, bot.inventory.slots[slot]?.name);
}

// 2. Check nearby chests at base
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest.id, maxDistance: 16 });
console.log('Found chests nearby:', chests.length);
for (const cpos of chests) {
  try {
    const chestBlock = bot.blockAt(cpos);
    const chest = await bot.openContainer(chestBlock);
    const items = chest.items().map(i => `${i.name}x${i.count}`).join(', ');
    console.log(`Chest at ${lib.fmt(cpos)} contains: ${items || 'empty'}`);
    chest.close();
  } catch (e) {
    console.log(`Error reading chest at ${lib.fmt(cpos)}: ${e.message}`);
  }
}

// 3. Check teammates
const players = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
console.log('Nearby teammates in dimension:');
for (const p of players) {
  console.log(`- ${p.username} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
}

// 4. Quick regear
console.log('Running quickRegear({ cobble: 16 })...');
await quickRegear({ cobble: 16 });

console.log('Post-regear inventory:', JSON.stringify(lib.inv()));
console.log('Held item:', bot.heldItem?.name, 'Offhand:', bot.inventory.slots[45]?.name);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  offhand: bot.inventory.slots[45]?.name,
  inv: lib.inv()
};
