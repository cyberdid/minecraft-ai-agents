// programs/329-mine-surface-iron.js
console.log('=== Program 329: Mine Surface Iron with lib.collect ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// Collect iron ore on East hill
try {
  console.log('Collecting iron ore...');
  const got = await lib.collect('iron_ore', 12);
  console.log('Collected iron ore:', JSON.stringify(got));
} catch (e) {
  console.log('Collect note:', e.message);
  // Fallback: search manually within 16 blocks and dig
  const ores = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 24, count: 12 });
  console.log(`Found ${ores.length} ores manually`);
  for (const ore of ores) {
    if (isCancelled()) break;
    try {
      console.log(`Digging ore at ${lib.fmt(ore.position)}...`);
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true });
      await lib.dig(ore.position.x, ore.position.y, ore.position.z);
      await lib.pickup(4);
    } catch (e2) {
      console.log('Manual dig note:', e2.message);
    }
  }
}

console.log('Alpha inventory now:', JSON.stringify(lib.inv()));
bot.chat(`team: Alpha mined iron on East hill! Inventory: ${JSON.stringify(lib.inv())}`);
