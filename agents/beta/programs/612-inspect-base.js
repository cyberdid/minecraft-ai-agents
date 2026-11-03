// programs/612-inspect-base.js
console.log('=== Inspect Base: Chest, Furnaces, Spawn ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Walk to door
console.log('Walking to base door at (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -53, 1);
} catch (e) {
  console.log('goTo door note:', e.message);
}

// 2. Go through door
console.log('Passing through door...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('goThroughDoor note:', e.message);
}

// 3. Set spawn at bed
try {
  await lib.setSpawn();
  console.log('Spawn set verified!');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 4. Inspect chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    console.log('CHEST CONTENTS:', chest.containerItems().map(i => `${i.name}x${i.count}`));
    // Withdraw useful items: armor, weapons, tools, food, cobble
    for (const item of chest.containerItems()) {
      if (['iron_sword', 'stone_sword', 'iron_pickaxe', 'stone_pickaxe', 'shield', 'iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots', 'cooked_porkchop', 'cooked_beef', 'bread', 'cobblestone'].includes(item.name)) {
        console.log(`Withdrawing ${item.name} x${item.count}...`);
        try { await chest.withdraw(item.type, null, item.count); } catch (e) {}
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest open note:', e.message);
  }
} else {
  console.log('No chest block at (293, 72, -57)');
}

// 5. Inspect furnaces at (295, 72, -54..-56)
for (let z = -54; z >= -56; z--) {
  const fb = bot.blockAt(new Vec3(295, 72, z));
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at (295, 72, ${z}): input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      if (f.outputItem()) {
        await f.takeOutput();
      }
      f.close();
    } catch (e) {}
  }
}

// Equip armor / weapon if obtained
await lib.equipArmor();
await lib.equipWeapon();

return {
  pos: bot.entity.position,
  inv: lib.inv()
};
