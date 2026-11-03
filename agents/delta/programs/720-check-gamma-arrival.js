console.log('=== PROGRAM 720: CHECK GAMMA ARRIVAL & EYES STATUS ===');

// Check all players in render
console.log('--- Players in Render ---');
for (const p of Object.values(bot.entities).filter(e => e.type === 'player')) {
  console.log(`- ${p.username}: pos=${lib.fmt(p.position)}, dim=${bot.game.dimension}, held=${p.heldItem ? p.heldItem.name : 'null'}`);
}

// Check Base Chest
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openContainer(cb);
    const items = chest.containerItems();
    console.log('--- Chest Items ---');
    for (const it of items) {
      if (['blaze_powder', 'blaze_rod', 'ender_eye', 'ender_pearl', 'iron_ingot'].includes(it.name)) {
        console.log(`  * ${it.name} x${it.count}`);
      }
    }
    chest.close();
  } catch (e) {}
}

console.log('\nBeta holding:');
const beta = bot.players['beta'];
if (beta && beta.entity) {
  console.log(`Beta held: ${beta.entity.heldItem?.name}`);
}

bot.chat('delta: Team status check: Delta ready in Base House (293, 72, -55) for Stronghold march!');
