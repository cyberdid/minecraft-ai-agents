// programs/263-extinguish-fire-and-pickup.js
console.log('=== EXTINGUISH SOUL FIRE & PICKUP LOOT AT (56, 68, -2) ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Scan and extinguish any soul_fire around (54, 67, -2)
const fireBlock = bot.blockAt(new Vec3(54, 67, -2));
console.log('Block at (54, 67, -2):', fireBlock?.name);

if (fireBlock && (fireBlock.name.includes('fire'))) {
  console.log('Extinguishing fire at (54, 67, -2)...');
  try {
    // Left click / dig to extinguish
    await lib.dig(54, 67, -2);
    console.log('Fire extinguished!');
  } catch (e) {
    console.log('Dig fire note:', e.message);
  }
}

// Check any other fire within 8m
const fires = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
  maxDistance: 8,
  count: 5
});
console.log(`Other fires within 8m (${fires.length}):`, fires.map(p => lib.fmt(p)));
for (const fp of fires) {
  try {
    console.log(`Extinguishing fire at ${lib.fmt(fp)}...`);
    await lib.dig(fp.x, fp.y, fp.z);
  } catch (e) {}
}

// 2. Walk to loot at (56, 68, -2)
console.log('Navigating to loot at (56, 68, -2)...');
try {
  await lib.goTo(56, 68, -2, 1, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo note:', e.message);
  try { await lib.goToXZ(56, -2, { timeoutMs: 8000 }); } catch (e2) {}
}

console.log('At loot location! Pos:', lib.fmt(bot.entity.position));

// 3. Pickup drops
const gained = await lib.pickup(8);
console.log('Items picked up. Inv now:', JSON.stringify(lib.inv()));

// 4. Equip shield and weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('=== GEAR UPDATE ===');
console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`gamma recovered loot at (56, 68, -2): Offhand: ${bot.entity.equipment[1]?.name || 'none'}, Mainhand: ${bot.entity.equipment[0]?.name || 'none'}, Inv: ${JSON.stringify(lib.inv())}`);
