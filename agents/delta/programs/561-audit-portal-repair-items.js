// programs/561-audit-portal-repair-items.js
console.log('=== AUDIT PORTAL REPAIR ITEMS ===');

// Check players
for (const name of ['alpha', 'beta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Player ${name} equipment:`, JSON.stringify(p.entity.equipment));
  }
}

// Check base chest
const cBlock = bot.blockAt(new Vec3(293, 72, -57));
if (cBlock) {
  try {
    const chest = await bot.openChest(cBlock);
    const items = chest.containerItems().map(i => `${i.name} x${i.count}`);
    console.log('Base chest items:', items.join(', '));
    chest.close();
  } catch (e) {
    console.log('Chest notice:', e.message);
  }
}

// Check furnaces
for (const z of [-54, -55, -56]) {
  const fb = bot.blockAt(new Vec3(295, 72, z));
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at z=${z}: in=${f.inputItem()?.name} out=${f.outputItem()?.name} fuel=${f.fuelItem()?.name}`);
      f.close();
    } catch (e) {}
  }
}

// Check ground items near portal
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 16);
console.log(`Ground items near portal: ${items.length}`);
for (const it of items) {
  console.log(`  Item id=${it.id} at ${lib.fmt(it.position)}`);
}

// Ask Alpha & Beta in chat
bot.chat('delta: Portal frame is missing 1 obsidian at (299, 72, -54)! Does anyone have obsidian and flint_and_steel?');

return { inv: lib.inv() };
