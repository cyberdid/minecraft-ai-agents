// programs/491-mine-ridge-gold-z50.js
console.log('Delta at z=-48.5:', lib.fmt(bot.entity.position), 'HP:', bot.health);

const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
let ores = [];
if (goldOreId) {
  ores = bot.findBlocks({
    matching: goldOreId,
    maxDistance: 32,
    count: 25
  }).map(p => bot.blockAt(p))
    .filter(b => b && b.position.y >= 63); // Safe height!
}

console.log(`Found ${ores.length} safe nether_gold_ore blocks near (61.5, 67, -48.5)!`);
let mined = 0;

for (const b of ores) {
  const p = b.position;
  console.log(`Approaching nether_gold_ore at ${lib.fmt(p)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(p.x, p.y, p.z, 2.5));
    const targetBlock = bot.blockAt(p);
    if (targetBlock && targetBlock.name === 'nether_gold_ore') {
      await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
      console.log(`Mining nether_gold_ore at ${lib.fmt(p)}...`);
      await bot.dig(targetBlock);
      mined++;
      await sleep(200);
      try { await lib.pickup(3.5); } catch (e) {}
    }
  } catch (e) {
    console.log(`Mining note at ${lib.fmt(p)}:`, e.message);
  }

  if (lib.count('gold_nugget') >= 36) break;
}

// Pickup drops
try { await lib.pickup(4); } catch (e) {}

// If no ores mined here, advance along ridge to (62, 67, -80)
if (mined === 0 && lib.count('gold_nugget') < 36) {
  console.log('Advancing to (62, 67, -80) along ridge...');
  const nextWPs = [
    { x: 61.5, y: 67, z: -65 },
    { x: 62.0, y: 67, z: -80 }
  ];
  for (const wp of nextWPs) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
      console.log(`Reached (${wp.x}, ${wp.y}, ${wp.z})! Pos: ${lib.fmt(bot.entity.position)}`);
    } catch (e) {}
  }

  // Scan again at z=-80
  const ores80 = bot.findBlocks({
    matching: goldOreId,
    maxDistance: 20,
    count: 15
  }).map(p => bot.blockAt(p))
    .filter(b => b && b.position.y >= 63);

  console.log(`At z=-80: found ${ores80.length} safe nether_gold_ore blocks!`);
  for (const b of ores80) {
    const p = b.position;
    try {
      await bot.pathfinder.goto(new goals.GoalNear(p.x, p.y, p.z, 2.5));
      const targetBlock = bot.blockAt(p);
      if (targetBlock && targetBlock.name === 'nether_gold_ore') {
        await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
        console.log(`Mining nether_gold_ore at ${lib.fmt(p)}...`);
        await bot.dig(targetBlock);
        mined++;
        await sleep(200);
        try { await lib.pickup(3.5); } catch (e) {}
      }
    } catch (e) {}

    if (lib.count('gold_nugget') >= 36) break;
  }
}

// Craft ingots and boots
const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  const ingots = Math.floor(nuggets / 9);
  try { await lib.craft('gold_ingot', ingots); } catch (e) {}
}

if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
  try {
    await lib.craft('golden_boots', 1);
    const gb = bot.inventory.items().find(it => it.name === 'golden_boots');
    if (gb) {
      await bot.equip(gb, 'feet');
      bot.chat('delta: Crafted & equipped golden_boots! 100% Piglin neutrality ACTIVE!');
    }
  } catch (e) {}
}

// Gear check
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

console.log(`Mining session done. Mined: ${mined}, Nuggets: ${lib.count('gold_nugget')}, Ingots: ${lib.count('gold_ingot')}, Boots: ${lib.count('golden_boots')}`);
bot.chat(`delta: Gold mining round finished! Mined ${mined} ores. Ingots: ${lib.count('gold_ingot')}, Boots: ${lib.count('golden_boots')}.`);

return {
  pos: bot.entity.position,
  mined,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  boots: lib.count('golden_boots'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
