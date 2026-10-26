// programs/297-pickup-iron-quarry-and-shield.js
console.log('=== PICKUP IRON, QUARRY & CRAFT SHIELD ===');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Walk towards (276, 61, -78) and pick up dropped items
try {
  await lib.goTo(276, 61, -77, 1, { timeoutMs: 5000 });
} catch (e) {
  console.log('goTo drop note:', e.message);
}
await sleep(300);
await lib.pickup(8);
console.log('Raw iron in inv:', lib.count('raw_iron'));

// 2. Check if there are any other iron ore blocks adjacent
const ironBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 6,
  count: 6
});
console.log(`Adjacent iron ores found (${ironBlocks.length}):`, ironBlocks.map(p => lib.fmt(p)));

const pick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (pick) await bot.equip(pick, 'hand');

for (const ip of ironBlocks) {
  const b = bot.blockAt(ip);
  if (b) {
    try {
      console.log(`Mining additional iron ore at ${lib.fmt(ip)}...`);
      await bot.lookAt(ip.offset(0.5, 0.5, 0.5));
      await bot.dig(b);
    } catch (e) {
      console.log('Dig ore note:', e.message);
    }
  }
}
await sleep(300);
await lib.pickup(6);
console.log('Raw iron in inv now:', lib.count('raw_iron'));

// 3. Mine 25 cobblestone from the stone walls right here
const stones = bot.findBlocks({
  matching: b => b && (b.name === 'stone' || b.name === 'andesite' || b.name === 'diorite'),
  maxDistance: 4,
  count: 35
});
console.log(`Nearby stone blocks (${stones.length})`);

let mined = 0;
for (const sp of stones) {
  if (lib.count('cobblestone') >= 28 || isCancelled()) break;
  const b = bot.blockAt(sp);
  if (!b) continue;
  try {
    await bot.lookAt(sp.offset(0.5, 0.5, 0.5));
    await bot.dig(b);
    mined++;
  } catch (e) {}
}
await sleep(300);
await lib.pickup(6);
console.log(`Mined ${mined} stone. Cobblestone now: ${lib.count('cobblestone')}`);

// 4. Climb back up to surface (y >= 69)
console.log('Climbing back to surface...');
try {
  await lib.goTo(276, 69, -74, 1, { timeoutMs: 8000 });
} catch (e) {
  console.log('Climb note:', e.message);
}

// 5. Return inside base
console.log('Returning inside base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 12000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Base door note:', e.message);
  try { await lib.door(294, 72, -54, true); await lib.walkTo(294.5, -55.5, 3000); } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 6. Smelt raw iron using oak planks
if (lib.count('raw_iron') > 0) {
  console.log(`Smelting ${lib.count('raw_iron')} raw_iron...`);
  try {
    await lib.smelt('raw_iron', 'oak_planks', lib.count('raw_iron'));
    console.log('Iron smelted! Ingots:', lib.count('iron_ingot'));
  } catch (e) {
    console.log('Smelt iron note:', e.message);
  }
}

// 7. Craft shield and equip
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield...');
  try {
    await lib.craft('shield', 1);
    await lib.equipArmor();
    console.log('Shield crafted and equipped!');
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
