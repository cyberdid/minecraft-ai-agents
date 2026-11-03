// programs/871-clear-and-prepare-sill.js
console.log('=== Program 871: Clear and Prepare Portal Sill (299, 72, -54) ===');

// Walk right to (298.5, 72.0, -53.5)
await lib.goTo(298.5, 72.0, -53.5, 0.5, { timeoutMs: 5000 });
console.log('At portal position:', lib.fmt(bot.entity.position));

const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Block at (299, 72, -54): ${sill ? sill.name : 'null'}, meta=${sill ? sill.metadata : 'null'}`);

// If water, place cobblestone to dry it out!
if (sill && (sill.name === 'water' || sill.name === 'flowing_water')) {
  console.log('Plugging sill with cobblestone to clear water...');
  await lib.place('cobblestone', 299, 72, -54);
  await sleep(500);

  // Now dig the cobblestone out so it becomes air!
  console.log('Digging cobblestone out to leave clean air basin...');
  const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
  if (pick) await bot.equip(pick, 'hand');
  await lib.dig(299, 72, -54);
  await sleep(500);
}

// Check sill block now
const sillNow = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Clean sill block at (299, 72, -54): ${sillNow ? sillNow.name : 'null'}`);

if (sillNow && sillNow.name === 'air') {
  bot.chat('Beta: Portal sill (299, 72, -54) is 100% dry and ready for lava!');
}

// Check where Delta and Alpha are
for (const [name, pl] of Object.entries(bot.players)) {
  if (pl && pl.entity) {
    console.log(`Player ${name} at ${lib.fmt(pl.entity.position)} held: ${pl.entity.heldItem ? pl.entity.heldItem.name : 'empty'}`);
  }
}
