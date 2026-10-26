// programs/243-gear-up-from-base.js
console.log('=== Step 1: Withdraw base materials and check furnaces ===');

// Withdraw supplies from base chest
try {
  await lib.withdraw({ cobblestone: 32, stick: 4, dirt: 11 }, 293, 72, -57);
  console.log('Withdrawn from chest. Current inv:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Error withdrawing from chest:', e.message);
}

// Check the 3 furnaces
const furnaceCoords = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const pos of furnaceCoords) {
  const block = bot.blockAt(pos);
  if (!block || !block.name.includes('furnace')) {
    console.log(`No furnace at ${lib.fmt(pos)} (found ${block?.name})`);
    continue;
  }
  try {
    const f = await bot.openFurnace(block);
    console.log(`Furnace at ${lib.fmt(pos)}:`, {
      input: f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : null,
      fuel: f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : null,
      output: f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : null,
    });
    // Take output if any
    if (f.outputItem()) {
      await f.takeOutput();
      console.log('Took output from furnace.');
    }
    f.close();
  } catch (e) {
    console.log(`Error checking furnace at ${lib.fmt(pos)}:`, e.message);
  }
}

// Craft stone tools using cobblestone and sticks
if (lib.count('stick') >= 2 && lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  console.log('Crafting stone_pickaxe...');
  await lib.craft('stone_pickaxe', 1);
}
if (lib.count('stick') >= 1 && lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
  console.log('Crafting stone_sword...');
  await lib.craft('stone_sword', 1);
}

await lib.equipArmor();
await lib.equipWeapon();

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Beta tools now:', JSON.stringify(lib.tools()));
bot.chat('beta: Geared with basic stone tools from base chest.');
