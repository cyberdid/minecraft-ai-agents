// programs/746-find-all-tools-for-portal-repair.js
console.log('=== Program 746: Audit All Tools for Portal Repair ===');

// 1. Check Alpha
console.log('Alpha inventory:', JSON.stringify(lib.inv()));

// 2. Check nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== bot.username) {
    console.log(`Player ${name} equipment:`, JSON.stringify(p.entity.equipment));
  }
}

// 3. Check Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    console.log('Base Chest items:');
    for (const it of chest.containerItems()) {
      if (it.name.includes('iron') || it.name.includes('bucket') || it.name.includes('flint') || it.name.includes('diamond') || it.name === 'obsidian') {
        console.log(` - ${it.name} x${it.count}`);
      }
    }
    chest.close();
  } catch (e) {}
}

// 4. Check Furnaces at (295, 72, -54..-56)
for (const z of [-54, -55, -56]) {
  const fb = bot.blockAt(new Vec3(295, 72, z));
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at z=${z}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      f.close();
    } catch (e) {}
  }
}

// 5. Inspect block at (299, 71, -54) (under missing obsidian)
const under = bot.blockAt(new Vec3(299, 71, -54));
console.log(`Block under missing obsidian (299, 71, -54): ${under?.name}`);

bot.chat('alpha: Auditing supplies for casting obsidian and flint & steel to reignite portal!');

return {};
