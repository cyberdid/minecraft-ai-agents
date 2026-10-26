// programs/557-inspect-base-chest-and-gear.js
console.log('=== Program 557: Inspect Base Chest & Gear ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Check chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
console.log('Chest block:', chestBlock?.name);

if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log(`Chest items (${items.length}):`);
    for (const item of items) {
      console.log(`  ${item.name} x${item.count}`);
    }
    
    // Withdraw useful items: gold, iron, shield, weapons, pickaxe, food, cobble
    const wanted = ['golden_boots', 'golden_helmet', 'golden_chestplate', 'golden_leggings', 'gold_ingot', 'raw_gold', 'shield', 'iron_sword', 'stone_sword', 'iron_pickaxe', 'stone_pickaxe', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'cobblestone'];
    for (const item of items) {
      if (wanted.includes(item.name)) {
        console.log(`Withdrawing ${item.name} x${item.count}...`);
        await chest.withdraw(item.type, null, item.count);
        await sleep(100);
      }
    }
    await chest.close();
  } catch (err) {
    console.log('Error opening chest:', err.message);
  }
}

// Check furnace array at (295, 72, -54..-56)
for (let z = -54; z >= -56; z--) {
  const fPos = new Vec3(295, 72, z);
  const fb = bot.blockAt(fPos);
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      const input = f.inputItem();
      const fuel = f.fuelItem();
      const output = f.outputItem();
      console.log(`Furnace at ${lib.fmt(fPos)}: in=${input?.name}x${input?.count}, fuel=${fuel?.name}x${fuel?.count}, out=${output?.name}x${output?.count}`);
      if (output) {
        console.log(`Taking furnace output ${output.name} x${output.count}...`);
        await f.takeOutput();
      }
      await f.close();
    } catch (e) {
      console.log(`Furnace ${lib.fmt(fPos)} error: ${e.message}`);
    }
  }
}

console.log('Alpha inventory after check:');
console.log(lib.inv());
