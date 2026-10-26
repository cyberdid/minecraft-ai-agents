// programs/267-pickup-bunker-loot-and-pave.js
console.log('=== PICKUP BUNKER LOOT & PAVE PATH TO EAST RIDGE ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Scan dropped items within 15m
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 16);
console.log(`Found ${items.length} dropped items near bunker:`);
for (const it of items) {
  console.log(` - Item ${it.id} at ${lib.fmt(it.position)} dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// 2. Pick up items within reach
for (const it of items) {
  if (it.isValid && it.position.distanceTo(bot.entity.position) < 12) {
    try {
      await lib.walkTo(it.position.x, it.position.z, 2000);
      bot.clearControlStates();
    } catch (e) {}
  }
}
const gained = await lib.pickup(8);
console.log('Items picked up. Inv:', JSON.stringify(lib.inv()));

// Equip weapon & armor if found
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Offhand:', bot.entity.equipment[1]?.name);

// 3. Scan fire blocks in 16m radius
const fires = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
  maxDistance: 16,
  count: 10
});
console.log(`Fires within 16m (${fires.length}):`, fires.map(p => lib.fmt(p)));

// Extinguish any fire blocks in the eastward path (x=40..63, z=-8..-3)
for (const fp of fires) {
  if (fp.x >= 40 && fp.x <= 63 && Math.abs(fp.z - (-6)) <= 3) {
    console.log(`Extinguishing fire at ${lib.fmt(fp)}...`);
    try {
      await lib.dig(fp.x, fp.y, fp.z);
    } catch (e) {
      console.log('Extinguish note:', e.message);
    }
  }
}

// 4. Advance carefully towards East Ridge Head (63, 65, -5)
console.log('Advancing towards East Ridge Head (63, 65, -5)...');
try {
  await lib.goTo(63, 65, -5, 2, { timeoutMs: 25000 });
} catch (e) {
  console.log('goTo Ridge note:', e.message);
  try { await lib.goToXZ(63, -5, { timeoutMs: 15000 }); } catch (e2) {}
}

console.log('=== ARRIVAL REPORT ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));
console.log('Tools:', JSON.stringify(lib.tools()));

bot.chat(`gamma at ${lib.fmt(bot.entity.position)} in Nether! HP: ${bot.health}/20, blocks: ${lib.count('cobblestone') + lib.count('netherrack') + lib.count('soul_sand')}`);
