// programs/398-harvest-f1-and-craft-boots.js
console.log('=== Step: Harvest F1 output, check F2/chest, craft iron gear ===');

// 1. Inspect and harvest F1 at (295, 72, -55)
const fb1 = bot.blockAt(new Vec3(295, 72, -55));
if (fb1) {
  try {
    const f1 = await bot.openFurnace(fb1);
    const inItem = f1.inputItem();
    const fuelItem = f1.fuelItem();
    const outItem = f1.outputItem();
    console.log(`F1: in=${inItem?.name}x${inItem?.count}, fuel=${fuelItem?.name}x${fuelItem?.count}, out=${outItem?.name}x${outItem?.count}, progress=${f1.progress}`);
    if (outItem && outItem.count > 0) {
      await f1.takeOutput();
      console.log(`Took ${outItem.count} ${outItem.name} from F1!`);
    }
    // If more fuel needed
    if (!fuelItem && inItem && lib.count('coal') > 0) {
      await f1.putFuel(mcData.itemsByName.coal.id, null, Math.min(lib.count('coal'), 2));
      console.log('Added coal to F1');
    }
    f1.close();
  } catch (e) {
    console.log('F1 error:', e.message);
  }
}

// 2. Inspect F2 at (295, 72, -57)
const fb2 = bot.blockAt(new Vec3(295, 72, -57));
if (fb2) {
  try {
    const f2 = await bot.openFurnace(fb2);
    const inItem = f2.inputItem();
    const fuelItem = f2.fuelItem();
    const outItem = f2.outputItem();
    console.log(`F2: in=${inItem?.name}x${inItem?.count}, fuel=${fuelItem?.name}x${fuelItem?.count}, out=${outItem?.name}x${outItem?.count}`);
    if (outItem && outItem.count > 0) {
      await f2.takeOutput();
      console.log(`Took ${outItem.count} ${outItem.name} from F2!`);
    }
    f2.close();
  } catch (e) {}
}

// 3. Inspect chest at (293, 72, -57)
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
    const ingots = items.find(i => i.name === 'iron_ingot');
    if (ingots) {
      await chest.withdraw(ingots.type, null, ingots.count);
      console.log(`Withdrew ${ingots.count} iron_ingot from chest.`);
    }
    chest.close();
  } catch (e) {}
}

console.log('Iron ingots held by Beta now:', lib.count('iron_ingot'));

// 4. Craft iron armor piece if possible
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
if (tableBlock && lib.count('iron_ingot') >= 4) {
  let target = 'iron_boots';
  if (lib.count('iron_ingot') >= 7) target = 'iron_leggings';
  else if (lib.count('iron_ingot') >= 5) target = 'iron_helmet';

  console.log(`Crafting ${target}...`);
  const r = bot.recipesFor(mcData.itemsByName[target].id, null, 1, tableBlock)[0];
  if (r) {
    await bot.craft(r, 1, tableBlock);
    console.log(`Crafted ${target}! Count: ${lib.count(target)}`);
  } else {
    // try boots
    const rb = bot.recipesFor(mcData.itemsByName.iron_boots.id, null, 1, tableBlock)[0];
    if (rb) {
      await bot.craft(rb, 1, tableBlock);
      console.log('Crafted iron_boots!');
    }
  }
}

// 5. Equip armor
await lib.equipArmor();

console.log('Gear check:');
for (const s of [5, 6, 7, 8, 45]) {
  const item = bot.inventory.slots[s];
  if (item) console.log(`  slot ${s}: ${item.name}`);
}

bot.chat(`beta: Base status: iron_ingots=${lib.count('iron_ingot')}, boots=${lib.count('iron_boots')}, helmet=${lib.count('iron_helmet')}, shield=${lib.count('shield')}.`);
