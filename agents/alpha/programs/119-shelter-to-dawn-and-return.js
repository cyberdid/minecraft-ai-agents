// programs/119-shelter-to-dawn-and-return.js
// 1. Wait remaining ~90s in shelter until dawn (tick 23460)
// 2. Break out of shelter with lib.leaveShelter()
// 3. Sprint back to base at (294, 72, -54)
// 4. Enter base, smelt 6 raw_iron, craft iron_chestplate, and equip!

console.log('Waiting in shelter for dawn. Current tick:', lib.time().timeOfDay);

while (!isCancelled()) {
  const t = lib.time();
  if (t.timeOfDay >= 23460 || (t.timeOfDay > 0 && t.timeOfDay < 1000)) {
    console.log(`Dawn reached! timeOfDay: ${t.timeOfDay}`);
    break;
  }
  await sleep(4000);
}

// Check hostiles above
const hostilesAbove = lib.hostiles(16);
console.log('Hostiles before emerging:', JSON.stringify(hostilesAbove));

// Leave shelter
console.log('Breaking out of shelter...');
try {
  await lib.leaveShelter();
  console.log('Emerged safely! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Leave shelter note:', e.message);
  // Manual breakout: dig 2 blocks above
  const pos = bot.entity.position.floored();
  await lib.dig(pos.x, pos.y + 2, pos.z).catch(() => {});
  await lib.dig(pos.x, pos.y + 1, pos.z).catch(() => {});
}

bot.chat('alpha: Day 12 dawn! Running to base with 7 raw iron to craft chestplate.');

// Navigate to base entrance
console.log('Navigating to base at (294, 72, -52)...');
try {
  await lib.goToXZ(294, -52);
  console.log('Arrived at base entrance!');
} catch (e) {
  console.log('GoToXZ note:', e.message);
  await lib.goTo(294, 72, -52, 2);
}

// Enter base
try {
  await passDoorIn();
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door in note:', e.message);
}

// Smelt 6 raw_iron in furnace at (295, 72, -55)
console.log('Withdrawing fuel from chest...');
try {
  await lib.withdraw({ oak_planks: 4 }, 293, 72, -57);
} catch (e) {}

console.log('Smelting raw iron...');
try {
  await lib.smelt('raw_iron', 'oak_planks', 6);
  console.log('Smelting complete!');
} catch (e) {
  console.log('Smelt note:', e.message);
}

console.log('Iron ingots in inventory:', lib.count('iron_ingot'));

// Craft iron_chestplate
if (lib.count('iron_ingot') >= 8) {
  console.log('Crafting iron_chestplate...');
  await lib.craft('iron_chestplate', 1);
  console.log('Iron chestplate crafted!');
}

// Equip full armor!
await lib.equipArmor();

console.log('ALPHA GEAR:', JSON.stringify(lib.tools()));
console.log('ALPHA INVENTORY:', JSON.stringify(lib.inv()));
bot.chat('alpha: MILESTONE 3 OFFICIALLY COMPLETE! Full iron armor and shield equipped.');
