console.log('=== PROGRAM 718: FOOD RESTOCK & EYE CRAFTING ===');
globalThis.isProgramCancelled = isCancelled;

console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Check furnaces for food
const fPositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -57),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56),
  new Vec3(286, 72, -62)
];

for (const fp of fPositions) {
  const b = bot.blockAt(fp);
  if (b && b.name.includes('furnace')) {
    try {
      const fn = await bot.openFurnace(b);
      const out = fn.outputItem();
      console.log(`Furnace at ${lib.fmt(fp)} output: ${out ? `${out.name} x${out.count}` : 'empty'}`);
      if (out && (out.name.startsWith('cooked_') || out.name.includes('bread') || out.name.includes('beef') || out.name.includes('porkchop') || out.name.includes('mutton') || out.name.includes('chicken'))) {
        await fn.takeOutput();
        console.log(`Took ${out.name} x${out.count} from furnace!`);
      }
      fn.close();
    } catch (e) {}
  }
}

// 2. Open Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log('--- Base Chest Contents ---');
    for (const it of items) {
      console.log(`  ${it.name} x${it.count}`);
    }

    // Check blaze powder
    const bp = items.find(i => i.name === 'blaze_powder');
    if (bp) {
      console.log(`Found ${bp.count} blaze_powder in chest! Withdrawing...`);
      await chest.withdraw(bp.type, null, bp.count);
    }

    // Check ender pearls
    const ep = items.find(i => i.name === 'ender_pearl');
    if (ep) {
      console.log(`Found ${ep.count} ender_pearl in chest! Withdrawing...`);
      await chest.withdraw(ep.type, null, ep.count);
    }

    // Check food
    const fd = items.find(i => i.name.startsWith('cooked_') || i.name === 'bread' || i.name === 'apple' || i.name.includes('beef') || i.name.includes('porkchop'));
    if (fd && bot.food < 18) {
      console.log(`Withdrawing ${fd.name} x${Math.min(fd.count, 8)}...`);
      await chest.withdraw(fd.type, null, Math.min(fd.count, 8));
    }

    chest.close();
  } catch (err) {
    console.log('Chest error:', err.message);
  }
}

// 3. Eat food if held
const foodItem = bot.inventory.items().find(i => i.name.startsWith('cooked_') || i.name === 'bread' || i.name === 'apple' || i.name.includes('beef') || i.name.includes('porkchop') || i.name.includes('mutton'));
if (foodItem && bot.food < 20) {
  console.log(`Eating ${foodItem.name}...`);
  try {
    await bot.equip(foodItem.type, 'hand');
    await bot.consume();
  } catch (e) {}
}

// 4. Craft ender_eye if holding blaze_powder & ender_pearl
const powCount = lib.count('blaze_powder');
const pearlCount = lib.count('ender_pearl');
console.log(`Delta holding: ${powCount} blaze_powder, ${pearlCount} ender_pearl, ${lib.count('ender_eye')} ender_eye`);

const toCraft = Math.min(powCount, pearlCount);
if (toCraft > 0) {
  console.log(`Crafting ${toCraft} ender_eye...`);
  try {
    await lib.craft('ender_eye', toCraft);
    console.log(`Crafted! Delta now holds ${lib.count('ender_eye')} ender_eye!`);
    bot.chat(`delta: Crafted ${lib.count('ender_eye')} Eyes of Ender! Total team eyes: ready!`);
  } catch (e) {
    console.log('Craft error:', e.message);
  }
}

// 5. Teammates report
console.log('\n--- Teammates in Base ---');
for (const p of Object.values(bot.entities).filter(e => e.type === 'player')) {
  console.log(`- ${p.username}: pos=${lib.fmt(p.position)}, held=${p.heldItem ? p.heldItem.name : 'null'}`);
}

bot.chat(`delta: Base operations verified! Delta HP: ${bot.health.toFixed(1)}/20, Food: ${bot.food}/20. Ready for Stronghold expedition!`);

return {
  hp: bot.health,
  food: bot.food,
  eyes: lib.count('ender_eye'),
  pearls: lib.count('ender_pearl'),
  powder: lib.count('blaze_powder'),
  inv: lib.inv()
};
