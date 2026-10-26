// programs/292-mine-iron-and-craft-shield.js
console.log('=== MINE IRON & CRAFT SHIELD ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Walk to safe surface spot above iron vein: (276, 69, -76)
console.log('Walking to surface quarry site...');
await lib.goTo(276, 69, -76, 1, { timeoutMs: 15000 });
console.log('Arrived at quarry site:', lib.fmt(bot.entity.position));

// 2. Dig a safe staircase down towards (276, 61, -78)
// Starting from z=-76 down to z=-78
// Step 1: dig down at z=-76, -77, -78
const targetOre = new Vec3(276, 61, -78);

console.log('Digging safe access trench/staircase down to y=61...');
for (let y = 68; y >= 61; y--) {
  for (let dz = 0; dz >= -2; dz--) {
    const p = new Vec3(276, y, -76 + dz);
    const b = bot.blockAt(p);
    if (b && b.name !== 'air') {
      try {
        if (bot.entity.position.distanceTo(p) > 4) {
          await lib.goTo(p.x, y + 1, p.z, 2, { timeoutMs: 4000 });
        }
        await bot.lookAt(p.offset(0.5, 0.5, 0.5));
        await bot.dig(b);
      } catch (e) {}
    }
  }
}

await sleep(300);
await lib.pickup(6);
console.log('Raw iron in inv after dig:', lib.count('raw_iron'));
console.log('Cobblestone in inv:', lib.count('cobblestone'));

// 3. Search for and mine any remaining iron ore in 5-block radius
const nearbyIron = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 6,
  count: 8
});
console.log(`Remaining iron ore blocks nearby (${nearbyIron.length}):`, nearbyIron.map(p => lib.fmt(p)));

for (const p of nearbyIron) {
  const b = bot.blockAt(p);
  if (b) {
    try {
      await bot.lookAt(p.offset(0.5, 0.5, 0.5));
      await bot.dig(b);
      console.log(`Mined iron ore at ${lib.fmt(p)}!`);
    } catch (e) {
      console.log(`Mine error at ${lib.fmt(p)}:`, e.message);
    }
  }
}

await sleep(300);
await lib.pickup(6);
const rawIronCount = lib.count('raw_iron');
console.log('Total raw iron collected:', rawIronCount);

if (rawIronCount === 0) {
  console.log('Warning: No raw iron collected yet! Checking inventory:', JSON.stringify(lib.inv()));
}

// 4. Climb back up to surface (y >= 69)
console.log('Climbing back to surface...');
try {
  await lib.goTo(276, 69, -74, 1, { timeoutMs: 10000 });
} catch (e) {
  console.log('Climb note:', e.message);
}

// 5. Return to base at (294, 72, -54)
console.log('Returning to base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Return to base note:', e.message);
  try { await lib.door(294, 72, -54, true); await lib.walkTo(294.5, -55.5, 3000); } catch (e2) {}
}

console.log('Inside base. Pos:', lib.fmt(bot.entity.position));

// 6. Craft oak planks from oak logs for shield & fuel
if (lib.count('*_planks') < 12 && lib.count('oak_log') > 0) {
  console.log('Crafting planks from oak_log...');
  await lib.craft('oak_planks', 12);
}

// 7. If we have raw_iron, smelt into iron_ingot
if (lib.count('raw_iron') > 0) {
  console.log('Smelting raw iron...');
  // Use oak_planks as fuel (1 plank smelts 1.5 items)
  try {
    await lib.smelt('raw_iron', 'oak_planks', lib.count('raw_iron'));
    console.log('Smelting complete! Iron ingots:', lib.count('iron_ingot'));
  } catch (e) {
    console.log('Smelt error:', e.message);
  }
}

// 8. Craft shield and equip
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield...');
  try {
    await lib.craft('shield', 1);
    await lib.equipArmor();
    console.log('Shield crafted and equipped!');
  } catch (e) {
    console.log('Shield craft error:', e.message);
  }
}

// 9. Report status and inventory
console.log('\n=== STATUS AT END OF PROGRAM ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Gear:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`gamma report: shield=${lib.count('shield')}, iron=${lib.count('iron_ingot')}, cobble=${lib.count('cobblestone')}, planks=${lib.count('*_planks')}`);
