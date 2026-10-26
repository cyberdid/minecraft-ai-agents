// programs/296-resupply-hunt-and-iron.js
console.log('=== RESUPPLY: HUNT, IRON & SHIELD ===');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Check players
console.log('\n--- PLAYERS ---');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name || 'none'}`);
  } else {
    console.log(`Player ${name}: no entity`);
  }
}

// 2. Equip stone sword
await lib.equipWeapon();

// 3. Scan for nearby animals within 48 blocks
const animalMobs = Object.values(bot.entities).filter(e => {
  if (!e || !e.name) return false;
  return ['cow', 'pig', 'sheep', 'chicken'].includes(e.name);
});
console.log(`Found ${animalMobs.length} animals nearby.`);

for (const a of animalMobs.slice(0, 4)) {
  if (isCancelled()) break;
  try {
    console.log(`Hunting ${a.name} at ${lib.fmt(a.position)}...`);
    await lib.goTo(a.position.x, a.position.y, a.position.z, 2, { timeoutMs: 8000 });
    while (a.isValid && bot.entity.position.distanceTo(a.position) <= 4) {
      await bot.lookAt(a.position.offset(0, a.height * 0.5, 0));
      bot.attack(a);
      await sleep(600);
    }
    await sleep(300);
    await lib.pickup(6);
  } catch (e) {
    console.log(`Hunt note for ${a.name}:`, e.message);
  }
}

// 4. Go to iron trench at (276, 65, -76)
console.log('Walking to iron trench at (276, 65, -76)...');
try {
  await lib.goTo(276, 65, -76, 1, { timeoutMs: 12000 });
} catch (e) {
  console.log('Trench approach note:', e.message);
}

// Equip stone pickaxe
const pick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (pick) await bot.equip(pick, 'hand');

// 5. Look for iron ore at (276, 61, -78) and nearby
const ironBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 8,
  count: 8
});
console.log(`Found ${ironBlocks.length} iron ore blocks:`, ironBlocks.map(p => lib.fmt(p)));

for (const ip of ironBlocks) {
  if (isCancelled()) break;
  try {
    // Dig any block directly above it if needed
    for (let y = ip.y + 1; y <= ip.y + 2; y++) {
      const above = new Vec3(ip.x, y, ip.z);
      const bAbove = bot.blockAt(above);
      if (bAbove && bAbove.name !== 'air' && bAbove.boundingBox === 'block') {
        await bot.lookAt(above.offset(0.5, 0.5, 0.5));
        await bot.dig(bAbove);
      }
    }
    const bOre = bot.blockAt(ip);
    if (bOre && bOre.name.includes('iron_ore')) {
      console.log(`Digging iron ore at ${lib.fmt(ip)}...`);
      await bot.lookAt(ip.offset(0.5, 0.5, 0.5));
      await bot.dig(bOre);
      console.log(`Mined iron ore at ${lib.fmt(ip)}!`);
    }
  } catch (e) {
    console.log(`Dig iron error at ${lib.fmt(ip)}:`, e.message);
  }
}

await sleep(300);
await lib.pickup(6);
console.log('Raw iron in inventory:', lib.count('raw_iron'));

// 6. Mine stone blocks for cobblestone (target: at least 32 cobble)
const stones = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 4,
  count: 40
});

for (const sp of stones) {
  if (lib.count('cobblestone') >= 32 || isCancelled()) break;
  const b = bot.blockAt(sp);
  if (!b) continue;
  try {
    await bot.lookAt(sp.offset(0.5, 0.5, 0.5));
    await bot.dig(b);
  } catch (e) {}
}

await sleep(300);
await lib.pickup(6);
console.log('Cobblestone now:', lib.count('cobblestone'));

// 7. Return to base
console.log('Returning to base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Base return note:', e.message);
  try { await lib.door(294, 72, -54, true); await lib.walkTo(294.5, -55.5, 3000); } catch (e2) {}
}

// 8. Smelt raw iron and meat in furnace at (295, 72, -55)
const furnacePos = new Vec3(295, 72, -55);
if (lib.count('raw_iron') > 0) {
  console.log(`Smelting ${lib.count('raw_iron')} raw_iron...`);
  try {
    await lib.smelt('raw_iron', 'oak_planks', lib.count('raw_iron'));
    console.log('Iron smelted! Ingots:', lib.count('iron_ingot'));
  } catch (e) {
    console.log('Smelt iron note:', e.message);
  }
}

// Smelt raw food if any
for (const rawFood of ['beef', 'mutton', 'porkchop', 'chicken']) {
  if (lib.count(rawFood) > 0) {
    console.log(`Cooking ${lib.count(rawFood)} ${rawFood}...`);
    try {
      await lib.smelt(rawFood, 'oak_planks', lib.count(rawFood));
    } catch (e) {
      console.log(`Cook ${rawFood} note:`, e.message);
    }
  }
}

// 9. Craft shield and equip
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield...');
  try {
    await lib.craft('shield', 1);
    await lib.equipArmor();
    console.log('Shield crafted and equipped in offhand!');
  } catch (e) {
    console.log('Craft shield note:', e.message);
  }
}

console.log('\n=== STATUS AT END OF PROGRAM ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Gear:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma report: shield=${lib.count('shield')}, iron=${lib.count('iron_ingot')}, cobble=${lib.count('cobblestone')}, planks=${lib.count('*_planks')}`);
