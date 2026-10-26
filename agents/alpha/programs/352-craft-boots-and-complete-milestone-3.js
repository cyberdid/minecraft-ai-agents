// programs/352-craft-boots-and-complete-milestone-3.js
console.log('=== Program 352: Craft Iron Boots & Complete Milestone 3 ===');

// Wait 25s for Beta's smelting in the furnace
console.log('Waiting for furnaces to smelt at least 4 iron ingots...');
await sleep(25000);

// Check all 3 base furnaces and collect output
const furnaces = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const p of furnaces) {
  const b = bot.blockAt(p);
  if (!b || b.name !== 'furnace') continue;
  try {
    const f = await bot.openFurnace(b);
    const out = f.outputItem();
    if (out && out.name === 'iron_ingot') {
      console.log(`Collecting ${out.count} iron_ingot from furnace at ${lib.fmt(p)}...`);
      await f.takeOutput();
    }
    f.close();
  } catch (e) {
    console.log(`Furnace ${lib.fmt(p)} note:`, e.message);
  }
}

// Also check chest
try {
  const contents = await lib.chestContents(293, 72, -57);
  if (contents.iron_ingot > 0) {
    await lib.withdraw({ iron_ingot: contents.iron_ingot }, 293, 72, -57);
  }
} catch (e) {}

console.log('Alpha iron_ingots in inventory:', lib.count('iron_ingot'));

// Craft iron_boots
if (lib.count('iron_ingot') >= 4) {
  try {
    await lib.craft('iron_boots', 1);
    console.log('CRAFTED IRON_BOOTS!');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

// Equip armor
await lib.equipArmor();
await lib.equipWeapon();

// Verify armor worn
const wornArmor = bot.inventory.items().filter(i => 
  i.name === 'iron_helmet' || i.name === 'iron_chestplate' || 
  i.name === 'iron_leggings' || i.name === 'iron_boots'
).map(i => i.name);

console.log('ALPHA WORN ARMOR:', JSON.stringify(wornArmor));
const hasFullIron = ['iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots'].every(piece => wornArmor.includes(piece));
console.log('HAS FULL IRON ARMOR:', hasFullIron);

if (hasFullIron) {
  bot.chat('team: MILESTONE 3 VERIFIED FOR ALPHA! Full iron armor (helmet, chestplate, leggings, boots) equipped!');
} else {
  bot.chat(`team: Alpha wearing: ${wornArmor.join(', ')}. Need ${4 - lib.count('iron_ingot')} more iron ingots for boots.`);
}
