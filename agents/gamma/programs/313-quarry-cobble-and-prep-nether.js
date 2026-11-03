// programs/313-quarry-cobble-and-prep-nether.js
console.log('=== QUARRY COBBLE & PREP NETHER ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Equip stone pickaxe
const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) await bot.equip(sp, 'hand');

// 2. Quarry cobblestone up to 32 blocks
const stoneBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 12,
  count: 35
}).filter(p => p.y >= 64);

console.log(`Found ${stoneBlocks.length} stone blocks nearby.`);

let mined = 0;
for (const p of stoneBlocks) {
  if (lib.count('cobblestone') >= 32 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (!b) continue;
  try {
    if (bot.entity.position.distanceTo(p) > 4) {
      await lib.goTo(p.x, p.y, p.z, 2, { timeoutMs: 3000 });
    }
    await bot.lookAt(p.offset(0.5, 0.5, 0.5));
    await bot.dig(b);
    mined++;
  } catch (e) {}
}

await sleep(300);
await lib.pickup(6);
console.log(`Mined ${mined} stone. Cobblestone in inv: ${lib.count('cobblestone')}`);

// 3. Check for nearby exposed iron ore
const ironNearby = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 16,
  count: 4
}).filter(p => p.y >= 60);

console.log(`Exposed iron ores nearby (${ironNearby.length}):`, ironNearby.map(p => lib.fmt(p)));

if (ironNearby.length > 0) {
  const ip = ironNearby[0];
  console.log(`Mining exposed iron ore at ${lib.fmt(ip)}...`);
  try {
    if (bot.entity.position.distanceTo(ip) > 4) await lib.goTo(ip.x, ip.y, ip.z, 2, { timeoutMs: 5000 });
    const b = bot.blockAt(ip);
    if (b) await bot.dig(b);
    await sleep(200);
    await lib.pickup(5);
  } catch (e) {}
  console.log('Raw iron in inv:', lib.count('raw_iron'));
}

// 4. Return to base to smelt iron (if any) or craft extra stone sword
console.log('Moving to base door at (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 12000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.door(294, 72, -54, true); await lib.walkTo(294.5, -55.5, 3000); } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// If we have raw_iron, smelt it
if (lib.count('raw_iron') > 0) {
  console.log('Smelting raw iron for shield...');
  try {
    await lib.goTo(295, 72, -55, 2, { timeoutMs: 4000 });
    await lib.smelt('raw_iron', 'birch_planks', 1);
    if (lib.count('iron_ingot') >= 1) {
      await lib.craft('shield', 1);
      await lib.equipArmor();
      console.log('Shield crafted and equipped!');
    }
  } catch (e) {
    console.log('Smelt/shield note:', e.message);
  }
}

// Craft spare stone sword if we have cobble
if (lib.count('stone_sword') < 2 && lib.count('cobblestone') >= 25 && lib.count('stick') >= 1) {
  console.log('Crafting spare stone sword...');
  try {
    await lib.craft('stone_sword', 1);
  } catch (e) {}
}

await lib.equipWeapon();

console.log('\n=== GEAR READY FOR NETHER ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Gear:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`gamma geared for Nether: stone_sword x${lib.count('stone_sword')}, cobble x${lib.count('cobblestone')}, planks x${lib.count('*_planks')}, shield=${lib.count('shield')}`);
