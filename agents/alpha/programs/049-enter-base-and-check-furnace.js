// programs/049-enter-base-and-check-furnace.js
// Walk inside base, stand right at furnace (294, 72, -55), take all smelted ingots!

console.log('alpha pos before:', lib.fmt(bot.entity.position));

// 1. Walk to doorstep at (294, 72, -52)
console.log('Walking to doorstep (294, 72, -52)...');
await lib.goTo(294, 72, -52, 1);

// 2. Open door
const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  console.log('Opening door...');
  await bot.activateBlock(doorBlock);
  await sleep(300);
}

// 3. Walk inside to (294, 72, -55) right next to furnace
console.log('Walking inside right next to furnace...');
await lib.walkTo(294, -55);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  console.log('Closing door...');
  await bot.activateBlock(doorBlock);
  await sleep(300);
}

console.log('alpha pos inside:', lib.fmt(bot.entity.position));

// 4. Inspect furnace at (295, 72, -55)
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
console.log('Furnace block:', furnaceBlock?.name);

const furnace = await bot.openFurnace(furnaceBlock);
console.log('Furnace opened successfully:');
console.log('  Input:', furnace.inputItem() ? `${furnace.inputItem().name} x${furnace.inputItem().count}` : 'empty');
console.log('  Fuel:', furnace.fuelItem() ? `${furnace.fuelItem().name} x${furnace.fuelItem().count}` : 'empty');
console.log('  Output:', furnace.outputItem() ? `${furnace.outputItem().name} x${furnace.outputItem().count}` : 'empty');

if (furnace.outputItem()) {
  console.log(`Taking ${furnace.outputItem().count} ${furnace.outputItem().name}...`);
  await furnace.takeOutput();
}

furnace.close();

console.log('Iron ingots in inventory now:', lib.count('iron_ingot'));

// Craft armor pieces with available ingots
const ingots = lib.count('iron_ingot');
if (lib.count('iron_chestplate') === 0 && ingots >= 8) {
  await lib.craft('iron_chestplate', 1);
  console.log('Crafted alpha iron_chestplate!');
}
if (lib.count('iron_leggings') === 0 && lib.count('iron_ingot') >= 7) {
  await lib.craft('iron_leggings', 1);
  console.log('Crafted alpha iron_leggings!');
}
if (lib.count('iron_helmet') === 0 && lib.count('iron_ingot') >= 5) {
  await lib.craft('iron_helmet', 1);
  console.log('Crafted alpha iron_helmet!');
}

await lib.equipArmor();
await lib.equipWeapon();

const slots = bot.inventory.slots;
console.log('Alpha worn armor:');
console.log('  Head:', slots[5]?.name);
console.log('  Torso:', slots[6]?.name);
console.log('  Legs:', slots[7]?.name);
console.log('  Feet:', slots[8]?.name);
console.log('  Offhand:', slots[45]?.name);

const time = lib.time();
console.log('timeOfDay:', time.timeOfDay, 'phase:', time.phase);

return {
  worn: {
    head: slots[5]?.name,
    torso: slots[6]?.name,
    legs: slots[7]?.name,
    feet: slots[8]?.name,
    offhand: slots[45]?.name
  },
  ingots: lib.count('iron_ingot'),
  time: time.timeOfDay
};
