// programs/720-east-hill-iron-and-shield.js
console.log('=== Program 720: East Hill Iron Quarry & Shield Crafting ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// 1. Step outside base door to (294, 72, -52)
console.log('Stepping outside base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(294, 72, -52, 1.0, { timeoutMs: 5000 }); } catch (e2) {}
}

// 2. Sprint along surface waypoints to East Hill (360, 65, -35)
bot.chat('Beta: Heading to East Hill (360, 65, -35) to mine iron for shield!');
console.log('Moving to East Hill...');

const waypoints = [
  new Vec3(310, 72, -46),
  new Vec3(335, 70, -40),
  new Vec3(360, 65, -35)
];

for (const wp of waypoints) {
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 12000 });
  } catch (err) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 8000 }); } catch (e2) {}
  }
}

console.log('Arrived at East Hill! Pos:', lib.fmt(bot.entity.position));

// 3. Scan and mine 2-4 raw iron ore
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 32,
  count: 10
});
console.log(`Found ${ores.length} iron ore blocks on East hill!`);

const sp = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (sp) await bot.equip(sp, 'hand');

let mined = 0;
for (const p of ores) {
  if (lib.count('raw_iron') >= 3 || isCancelled()) break;
  try {
    console.log(`Mining iron ore at ${lib.fmt(p)}...`);
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
    mined++;
  } catch (e) {
    console.log(`Mine note at ${lib.fmt(p)}:`, e.message);
  }
}

console.log(`Mined ${mined} iron ore. Raw iron in inventory: ${lib.count('raw_iron')}`);

// 4. Return to base at (293, 72, -55)
console.log('Returning to base...');
const returnWps = [
  new Vec3(335, 70, -40),
  new Vec3(310, 72, -46),
  new Vec3(294, 72, -54)
];

for (const wp of returnWps) {
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 12000 });
  } catch (err) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 8000 }); } catch (e2) {}
  }
}

console.log('Back at base! Pos:', lib.fmt(bot.entity.position));

// 5. Smelt raw_iron in base furnace at (295, 72, -55)
if (lib.count('raw_iron') > 0 && lib.count('iron_ingot') === 0) {
  console.log('Smelting raw iron in base furnace...');
  try {
    const fuel = lib.count('coal') > 0 ? 'coal' : (lib.count('birch_planks') > 2 ? 'birch_planks' : 'birch_log');
    await lib.smelt('raw_iron', fuel, 1);
    console.log('Smelted iron ingot!');
  } catch (e) {
    console.log('Smelt error:', e.message);
  }
}

// 6. Craft shield (1 iron ingot + 6 planks)
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
  if (lib.count('*_planks') < 6 && lib.count('*_log') > 0) {
    try { await lib.craft('birch_planks', 8); } catch (e) {}
  }
  console.log('Crafting shield...');
  try {
    await lib.craft('shield', 1);
    console.log('CRAFTED SHIELD SUCCESSFULLY!');
  } catch (e) {
    console.log('Craft shield error:', e.message);
  }
}

// 7. Equip shield in offhand
try {
  await lib.equipArmor();
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) {
    await bot.equip(shield, 'off-hand');
    console.log('Equipped shield in off-hand!');
  }
} catch (e) {}

const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

const offhand = bot.inventory.slots[45];
console.log('Off-hand slot 45:', offhand?.name, 'Held:', bot.heldItem?.name);

if (offhand?.name === 'shield') {
  bot.chat('Beta: Full Shield Kit Equipped! 100% fireball immunity active!');
}

console.log('Program 720 complete. Inv:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  shield: lib.count('shield'),
  blaze_rods: lib.count('blaze_rod'),
  raw_iron: lib.count('raw_iron'),
  iron_ingot: lib.count('iron_ingot')
};
