console.log('=== PROGRAM 689: CHECK TEAM & CRAFTING STATUS ===');
console.log('Delta pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

for (const p of Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username)) {
  console.log(`Player: ${p.username} at ${lib.fmt(p.position)} (dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m), heldItem: ${p.heldItem ? p.heldItem.name : 'null'}`);
}

// Check Base Chest
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log('Base Chest items:');
    for (const it of items) {
      console.log(`  ${it.name} x${it.count}`);
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Check delta inventory
console.log('Delta inv:', lib.inv());

// Check if ender_eye or eye_of_ender exists in mcData
console.log('ender_eye in mcData:', !!mcData.itemsByName['ender_eye']);
console.log('eye_of_ender in mcData:', !!mcData.itemsByName['eye_of_ender']);
