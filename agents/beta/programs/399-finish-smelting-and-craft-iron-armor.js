// programs/399-finish-smelting-and-craft-iron-armor.js
console.log('=== Step: Finish smelting and craft iron armor piece ===');

const fb1 = bot.blockAt(new Vec3(295, 72, -55));
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));

// Wait 12 seconds for F1 to smelt next ingots
await sleep(12000);

if (fb1) {
  try {
    const f1 = await bot.openFurnace(fb1);
    const out = f1.outputItem();
    console.log(`F1 out: ${out?.name}x${out?.count}`);
    if (out && out.count > 0) {
      await f1.takeOutput();
      console.log(`Took ${out.count} ${out.name} from F1!`);
    }
    f1.close();
  } catch (e) {
    console.log('F1 error:', e.message);
  }
}

console.log('Total iron ingots in inventory:', lib.count('iron_ingot'));

// Craft armor piece based on total ingots available
if (tableBlock && lib.count('iron_ingot') >= 4) {
  let target = 'iron_boots'; // default 4
  if (lib.count('iron_ingot') >= 8) target = 'iron_chestplate';
  else if (lib.count('iron_ingot') >= 7) target = 'iron_leggings';
  else if (lib.count('iron_ingot') >= 5) target = 'iron_helmet';

  console.log(`Crafting ${target}...`);
  const r = bot.recipesFor(mcData.itemsByName[target].id, null, 1, tableBlock)[0];
  if (r) {
    await bot.craft(r, 1, tableBlock);
    console.log(`Successfully crafted ${target}!`);
  } else {
    // fallback boots
    const rb = bot.recipesFor(mcData.itemsByName.iron_boots.id, null, 1, tableBlock)[0];
    if (rb) {
      await bot.craft(rb, 1, tableBlock);
      console.log('Crafted iron_boots (fallback)!');
    }
  }
}

// Equip armor
await lib.equipArmor();

console.log('Armor check:');
for (const s of [5, 6, 7, 8, 45]) {
  const item = bot.inventory.slots[s];
  if (item) console.log(`  slot ${s}: ${item.name}`);
}

bot.chat(`beta: Milestone 3 progress! Gear equipped: helmet=${bot.inventory.slots[5]?.name}, chest=${bot.inventory.slots[6]?.name}, legs=${bot.inventory.slots[7]?.name}, boots=${bot.inventory.slots[8]?.name}, offhand=${bot.inventory.slots[45]?.name}.`);
