// programs/306-enter-base-and-check-delta.js
console.log('=== ENTER BASE & REGROUP WITH DELTA ===');
console.log('Current pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);

// 1. Move to base door at (294, 72, -53)
console.log('Approaching base entrance...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 12000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (e) {
  console.log('Door entry note:', e.message);
  try { await lib.door(294, 72, -54, true); await lib.walkTo(294.5, -55.5, 3000); } catch (e2) {}
}

console.log('Position now:', lib.fmt(bot.entity.position));

// 2. Inspect Delta and other players in base
console.log('\n--- PLAYERS ---');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    const held = p.entity.heldItem?.name || 'none';
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} holding: ${held}`);
  }
}

// 3. Inspect base chest
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Chest contents at (293, 72, -57):', JSON.stringify(contents));
} catch (e) {
  console.log('Chest error:', e.message);
}

// 4. Deposit bone_meal, saplings, buttons to avoid clutter
try {
  await lib.deposit({ bone_meal: 'all', oak_sapling: 'all', oak_button: 'all' }, 293, 72, -57);
} catch (e) {}

// 5. Check if Alpha died near base and items can be safely recovered
const drownedPos = new Vec3(297, 48, -62);
console.log('Alpha drowned at (297, 48, -62) - deathtrap aquifer zone (DO NOT ENTER).');

// 6. Report status to team
console.log('\nGamma inventory:', JSON.stringify(lib.inv()));
bot.chat(`gamma with Delta at base. Ready for Nether expedition! Planks x${lib.count('*_planks')}, Cobble x${lib.count('cobblestone')}`);
