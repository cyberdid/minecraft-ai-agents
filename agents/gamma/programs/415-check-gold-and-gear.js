// programs/415-check-gold-and-gear.js
console.log('=== CHECK GOLD & CRAFTING ===');
console.log('Inv:', JSON.stringify(lib.inv()));

// Check base chest
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    console.log('Chest full contents:');
    for (const item of chest.items()) {
      console.log(`  ${item.name} x${item.count}`);
    }
    chest.close();
  } catch (e) {
    console.log('Chest err:', e.message);
  }
}

// Check if we can craft or smelt gold
console.log('Gold ingots:', lib.count('gold_ingot'));
console.log('Raw gold:', lib.count('raw_gold'));
console.log('Gold nuggets:', lib.count('gold_nugget'));
console.log('Golden boots:', lib.count('golden_boots'));
console.log('Golden helmet:', lib.count('golden_helmet'));
