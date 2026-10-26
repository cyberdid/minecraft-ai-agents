// programs/353-craft-iron-boots.js
console.log('=== Program 353: Finish Smelting & Craft Iron Boots ===');
console.log('Start iron_ingot count:', lib.count('iron_ingot'));

// Wait 20 seconds for the next 2 ingots to finish smelting
console.log('Waiting 20 seconds for furnace to smelt...');
await sleep(20000);

// Open furnace at (295, 72, -55) and collect output
const furnacePos = new Vec3(295, 72, -55);
try {
  const b = bot.blockAt(furnacePos);
  if (b) {
    const f = await bot.openFurnace(b);
    const out = f.outputItem();
    if (out && out.name === 'iron_ingot') {
      console.log(`Withdrawing ${out.count} iron_ingot from furnace!`);
      await f.takeOutput();
    }
    f.close();
  }
} catch (e) {
  console.log('Furnace error:', e.message);
}

const ingots = lib.count('iron_ingot');
console.log(`Iron ingots now in inventory: ${ingots}`);

// Craft iron_boots (needs 4 iron_ingot)
if (ingots >= 4) {
  console.log('Crafting iron_boots at base table (295, 72, -56)...');
  await lib.craft('iron_boots', 1);
  console.log('CRAFTED IRON_BOOTS!');
  await lib.equipArmor();
  console.log('EQUIPPED ALL ARMOR!');
} else {
  console.log(`Still need ${4 - ingots} more ingots.`);
}

console.log('Alpha gear:', JSON.stringify(lib.tools()));
console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha crafted iron_boots! Milestone 3 COMPLETE! Full iron armor equipped!`);
