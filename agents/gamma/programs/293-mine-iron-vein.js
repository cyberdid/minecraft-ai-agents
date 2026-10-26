// programs/293-mine-iron-vein.js
console.log('=== TARGETED IRON ORE MINING ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Equip stone pickaxe
const pick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (pick) await bot.equip(pick, 'hand');

// 2. Scan iron ore nearby (within 8 blocks)
const ironBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 8,
  count: 10
});

console.log(`Iron ore blocks nearby (${ironBlocks.length}):`, ironBlocks.map(p => lib.fmt(p)));

// 3. For each iron block, dig any blocking obstruction then dig the ore
for (const p of ironBlocks) {
  if (isCancelled()) break;
  console.log(`Mining iron ore at ${lib.fmt(p)}...`);
  try {
    // If block is directly below or adjacent, dig obstruction first
    const above = p.offset(0, 1, 0);
    const bAbove = bot.blockAt(above);
    if (bAbove && bAbove.name !== 'air') {
      await bot.lookAt(above.offset(0.5, 0.5, 0.5));
      await bot.dig(bAbove);
    }
    const b = bot.blockAt(p);
    if (b && b.name.includes('iron_ore')) {
      await bot.lookAt(p.offset(0.5, 0.5, 0.5));
      await bot.dig(b);
      console.log(`Successfully mined iron ore at ${lib.fmt(p)}!`);
    }
  } catch (e) {
    console.log(`Error mining at ${lib.fmt(p)}:`, e.message);
  }
}

await sleep(400);
await lib.pickup(6);
console.log('Raw iron in inventory:', lib.count('raw_iron'));
console.log('Cobblestone in inventory:', lib.count('cobblestone'));

// 4. Also mine a few stone blocks around to get ~16-20 cobblestone
const stones = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite'),
  maxDistance: 4,
  count: 15
});

for (const p of stones) {
  if (lib.count('cobblestone') >= 16 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (!b) continue;
  try {
    await bot.lookAt(p.offset(0.5, 0.5, 0.5));
    await bot.dig(b);
  } catch (e) {}
}

await sleep(300);
await lib.pickup(6);
console.log('Cobblestone now:', lib.count('cobblestone'));

// 5. Climb back up to surface (y >= 69)
console.log('Climbing back to surface...');
try {
  await lib.goTo(276, 69, -74, 1, { timeoutMs: 10000 });
} catch (e) {
  console.log('Climb note:', e.message);
}

// 6. Return inside base
console.log('Returning inside base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 12000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door return note:', e.message);
  try { await lib.door(294, 72, -54, true); await lib.walkTo(294.5, -55.5, 3000); } catch (e2) {}
}

console.log('Pos inside base:', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));
const t = lib.time();
console.log(`Time: ${t.timeOfDay} (${t.phase}), night in ${t.secondsUntilNight}s`);
