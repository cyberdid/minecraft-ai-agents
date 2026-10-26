// programs/370-monitor-smelting-and-portal.js
console.log('=== Program 370: Smelt Iron, Craft Beta Armor & Verify Portal ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Monitor furnace at (295, 72, -55) for smelting progress
const fBlock = bot.blockAt(new Vec3(295, 72, -55));
let ironIngots = 0;

if (fBlock) {
  console.log('Waiting for iron ingots to smelt in furnace...');
  for (let round = 0; round < 15; round++) {
    if (isCancelled()) break;
    try {
      const f = await bot.openFurnace(fBlock);
      const out = f.outputItem();
      const fuel = f.fuelItem();
      const inp = f.inputItem();
      console.log(`Furnace: input=${inp?.count || 0} ${inp?.name || ''}, fuel=${fuel?.count || 0}, output=${out?.count || 0} ${out?.name || ''}`);
      if (out && out.name === 'iron_ingot' && out.count >= 4) {
        console.log(`Withdrawing ${out.count} iron ingots...`);
        await f.takeOutput();
        ironIngots = lib.count('iron_ingot');
        f.close();
        break;
      }
      f.close();
    } catch (e) {
      console.log('Furnace check error:', e.message);
    }
    await sleep(4000);
  }
}

console.log('Alpha iron ingots now:', lib.count('iron_ingot'));

// 2. If we have at least 4 iron ingots, craft iron_boots or iron_chestplate
if (lib.count('iron_ingot') >= 8) {
  console.log('Crafting iron_chestplate for Beta...');
  try {
    await lib.craft('iron_chestplate', 1);
    console.log('Crafted iron_chestplate!');
    await lib.deposit({ iron_chestplate: 1 }, 293, 72, -57);
    bot.chat('team: Crafted iron_chestplate and deposited in base chest for Beta!');
  } catch (e) {
    console.log('Craft chestplate error:', e.message);
  }
} else if (lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots for Beta...');
  try {
    await lib.craft('iron_boots', 1);
    console.log('Crafted iron_boots!');
    await lib.deposit({ iron_boots: 1 }, 293, 72, -57);
    bot.chat('team: Crafted iron_boots and deposited in base chest for Beta!');
  } catch (e) {
    console.log('Craft boots error:', e.message);
  }
}

// 3. Verify Nether portal at (298..300, 72..75, -54)
console.log('Checking Nether portal blocks...');
let portalBlocksFound = 0;
for (let y = 73; y <= 75; y++) {
  for (let x = 299; x <= 300; x++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    if (b && b.name === 'nether_portal') {
      portalBlocksFound++;
    }
    console.log(`  Block at (${x}, ${y}, -54): ${b?.name}`);
  }
}
console.log(`Portal active blocks: ${portalBlocksFound}/6`);

console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat(`team: Portal check: ${portalBlocksFound}/6 portal blocks active. Alpha ready with 120+ cobblestone for Nether bunker!`);
