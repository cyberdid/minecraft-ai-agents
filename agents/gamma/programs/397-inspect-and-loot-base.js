// programs/397-inspect-and-loot-base.js
console.log('=== INSPECT AND LOOT BASE ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Ensure spawn is set at base bed
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 2. Inspect chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
console.log('Chest block:', chestBlock ? chestBlock.name : 'null');

if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const chest = await bot.openContainer(chestBlock);
    console.log('Chest items:');
    const items = chest.containerItems();
    for (const item of items) {
      console.log(`- ${item.name} x${item.count}`);
    }

    // Items we would love to withdraw:
    // Cooked food, iron ingots, shield, swords, pickaxes, cobblestone, wood/planks
    const wanted = [
      'cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread',
      'shield', 'iron_sword', 'diamond_sword', 'stone_sword',
      'diamond_pickaxe', 'iron_pickaxe', 'stone_pickaxe',
      'iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots',
      'golden_boots', 'golden_helmet',
      'iron_ingot', 'raw_iron', 'cobblestone', 'oak_planks', 'birch_planks', 'spruce_planks', 'oak_log', 'birch_log'
    ];

    for (const name of wanted) {
      const match = items.find(it => it.name === name);
      if (match) {
        // take some or all
        const takeCount = Math.min(match.count, name.includes('sword') || name.includes('pickaxe') || name === 'shield' ? 1 : 16);
        try {
          await chest.withdraw(match.type, null, takeCount);
          console.log(`Withdrew ${takeCount} of ${match.name}`);
        } catch (we) {
          console.log(`Could not withdraw ${name}:`, we.message);
        }
      }
    }
    chest.close();
  } catch (err) {
    console.log('Error opening chest:', err.message);
  }
}

// 3. Inspect furnaces at (295, 72, -55), (295, 72, -54), (295, 72, -56)
const furnaceCoords = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const fPos of furnaceCoords) {
  const fBlock = bot.blockAt(fPos);
  if (fBlock && fBlock.name.includes('furnace')) {
    try {
      const furnace = await bot.openFurnace(fBlock);
      const out = furnace.outputItem();
      const input = furnace.inputItem();
      const fuel = furnace.fuelItem();
      console.log(`Furnace at ${lib.fmt(fPos)}: in=${input?.name}x${input?.count}, fuel=${fuel?.name}x${fuel?.count}, out=${out?.name}x${out?.count}`);
      if (out) {
        await furnace.takeOutput();
        console.log(`Took furnace output: ${out.name} x${out.count}`);
      }
      furnace.close();
    } catch (fe) {
      console.log(`Furnace at ${lib.fmt(fPos)} error:`, fe.message);
    }
  }
}

try {
  await lib.equipArmor();
} catch (e) {}

try {
  await lib.equipWeapon();
} catch (e) {}

console.log('Ending inventory:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
bot.chat(`gamma: Base check complete. Inv: ${Object.keys(lib.inv()).join(', ') || 'empty'}`);
