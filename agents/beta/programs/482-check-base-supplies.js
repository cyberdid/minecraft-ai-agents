// programs/482-check-base-supplies.js
console.log('=== Step: Check Base Supplies & Teammate Status ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check base chest at (293, 72, -57)
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Base chest items:', items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    
    // Withdraw any tools, weapons, armor, iron, wood, food
    for (const item of items) {
      if (item.name.endsWith('_sword') || item.name.endsWith('_pickaxe') || item.name.endsWith('_axe') || 
          item.name === 'shield' || item.name.startsWith('iron_') || item.name === 'raw_iron' ||
          item.name.endsWith('_log') || item.name.endsWith('_planks') || item.name.startsWith('cooked_') ||
          item.name === 'bread' || item.name === 'apple' || item.name === 'oak_door' || item.name === 'stick') {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.name}x${item.count} from chest!`);
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 2. Check Furnaces F1 (295, 72, -55) and F2 (295, 72, -57)
for (const fp of [new Vec3(295, 72, -55), new Vec3(295, 72, -57)]) {
  const fb = bot.blockAt(fp);
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fp)}: output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      if (f.outputItem()) await f.takeOutput();
      f.close();
    } catch (e) {}
  }
}

// 3. Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: At base re-arming station. Inv: ${JSON.stringify(lib.inv())}. Coordinating Nether advance!`);
