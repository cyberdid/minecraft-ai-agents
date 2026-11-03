console.log('=== PROGRAM 717: CHECK BASE RESOURCES & EYES OF ENDER ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

// Vacuum items
try { await lib.pickup(4.0); } catch (e) {}

// Check Base Chest
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log('=== Base Chest Contents ===');
    for (const it of items) {
      console.log(`  ${it.name} x${it.count}`);
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Check all teammates
console.log('\n=== Teammates in Base ===');
for (const p of Object.values(bot.entities).filter(e => e.type === 'player')) {
  console.log(`- ${p.username}: pos=${lib.fmt(p.position)}, held=${p.heldItem ? p.heldItem.name : 'null'}`);
}

console.log('\nDelta Inventory:', JSON.stringify(lib.inv()));
console.log('Ender eyes held by delta:', lib.count('ender_eye'));
console.log('Ender pearls held by delta:', lib.count('ender_pearl'));
console.log('Blaze powder held by delta:', lib.count('blaze_powder'));
