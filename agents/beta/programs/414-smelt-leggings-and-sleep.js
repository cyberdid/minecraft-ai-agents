// programs/414-smelt-leggings-and-sleep.js
console.log('=== Step: Smelt 7 iron ingots, craft iron_leggings, equip, and sleep ===');
console.log('Current time:', bot.time.timeOfDay, 'Beta pos:', lib.fmt(bot.entity.position));

// 1. Ensure door is closed
const door = bot.blockAt(new Vec3(294, 72, -54));
if (door && door._properties?.open) {
  try {
    await bot.activateBlock(door);
    console.log('Closed base door for night protocol.');
  } catch (e) {}
}

// 2. Wait until tick 12542 (nightfall) while F1 smelts
console.log('Waiting for smelting and nightfall (tick 12542)...');
while (bot.time.timeOfDay < 12542 && !isCancelled()) {
  const rem = Math.max(0, Math.ceil((12542 - bot.time.timeOfDay) / 20));
  console.log(`Time: ${bot.time.timeOfDay}, ${rem}s until night...`);
  await sleep(5000);
}

// 3. Harvest iron ingots from F1 (295, 72, -55)
const fb1 = bot.blockAt(new Vec3(295, 72, -55));
if (fb1) {
  try {
    const f1 = await bot.openFurnace(fb1);
    const out = f1.outputItem();
    console.log(`F1 output: ${out?.name}x${out?.count}`);
    if (out && out.count > 0) {
      await f1.takeOutput();
      console.log(`Harvested ${out.count} ${out.name} from F1!`);
    }
    f1.close();
  } catch (e) {
    console.log('F1 harvest error:', e.message);
  }
}

console.log('Total iron ingots in inventory:', lib.count('iron_ingot'));

// 4. Craft iron_leggings at crafting table (295, 72, -56)
const tableBlock = bot.blockAt(new Vec3(295, 72, -56));
if (tableBlock && lib.count('iron_ingot') >= 7) {
  console.log('Crafting iron_leggings...');
  const r = bot.recipesFor(mcData.itemsByName.iron_leggings.id, null, 1, tableBlock)[0];
  if (r) {
    await bot.craft(r, 1, tableBlock);
    console.log('Successfully crafted iron_leggings!');
  }
} else if (tableBlock && lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots (partial)...');
  const rb = bot.recipesFor(mcData.itemsByName.iron_boots.id, null, 1, tableBlock)[0];
  if (rb) {
    await bot.craft(rb, 1, tableBlock);
    console.log('Crafted iron_boots!');
  }
}

// 5. Equip armor
await lib.equipArmor();

console.log('Beta gear:');
for (const s of [5, 6, 7, 8, 45]) {
  const item = bot.inventory.slots[s];
  if (item) console.log(`  slot ${s}: ${item.name}`);
}

// 6. Sleep in bed
console.log('Sleeping in bed...');
try {
  await lib.sleepInBed();
  console.log('lib.sleepInBed active');
} catch (e) {
  console.log('lib.sleepInBed note:', e.message);
  const bedBlock = bot.blockAt(new Vec3(294, 72, -56)) || bot.blockAt(new Vec3(293, 72, -56));
  if (bedBlock) {
    try {
      await bot.sleep(bedBlock);
      console.log('Entered bed directly at', bedBlock.position);
    } catch (err) {
      console.log('bot.sleep note:', err.message);
    }
  }
}

// 7. Wait for morning
for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.time.timeOfDay < 1000 || bot.time.timeOfDay > 23450) {
    console.log('Dawn reached! Time:', bot.time.timeOfDay);
    break;
  }
}

if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

console.log(`Dawn status: time=${bot.time.timeOfDay}, health=${bot.health}/20, food=${bot.food}/20`);
bot.chat(`beta: Morning! Time: ${bot.time.timeOfDay}. Wearing helmet=${bot.inventory.slots[5]?.name}, legs=${bot.inventory.slots[7]?.name}, boots=${bot.inventory.slots[8]?.name}, offhand=${bot.inventory.slots[45]?.name}.`);
