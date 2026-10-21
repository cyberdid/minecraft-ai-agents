const Vec3 = require('vec3');

console.log('--- Placing crafting table and crafting tools ---');

const feet = bot.entity.position.floored();
const offsets = [
  new Vec3(1, -1, 0),
  new Vec3(-1, -1, 0),
  new Vec3(0, -1, 1),
  new Vec3(0, -1, -1)
];

let groundRef = null;
for (const off of offsets) {
  const g = bot.blockAt(feet.plus(off));
  const above = bot.blockAt(feet.plus(off).offset(0, 1, 0));
  if (g && g.boundingBox === 'block' && above && (above.name === 'air' || above.name === 'short_grass')) {
    if (above.name === 'short_grass') await bot.dig(above);
    groundRef = g;
    break;
  }
}
if (!groundRef) groundRef = bot.blockAt(feet.offset(0, -1, 0));

console.log('Placing table on', groundRef.position);
const tableItem = bot.inventory.items().find(i => i.name === 'crafting_table');
await bot.equip(tableItem, 'hand');
await bot.waitForTicks(3);
await bot.placeBlock(groundRef, new Vec3(0, 1, 0));
await bot.waitForTicks(5);

const tablePos = groundRef.position.offset(0, 1, 0);
const tableBlock = bot.blockAt(tablePos);
console.log('Table block is:', tableBlock.name);

// Open table window
const window = await bot.openBlock(tableBlock);
console.log('Window opened:', window.type);

// Function to find item inside this window
function findInWindow(name) {
  return window.slots.find((s, idx) => idx >= 10 && s && s.name === name);
}

// 1. Craft Wooden Pickaxe: Planks in 1, 2, 3; Sticks in 5, 8
console.log('Crafting wooden pickaxe...');
let planks = findInWindow('oak_planks');
await bot.clickWindow(planks.slot, 0, 0); // pick up planks
await bot.clickWindow(1, 1, 0); // 1 in slot 1
await bot.clickWindow(2, 1, 0); // 1 in slot 2
await bot.clickWindow(3, 1, 0); // 1 in slot 3
await bot.clickWindow(planks.slot, 0, 0); // put remainder back
await bot.waitForTicks(2);

let sticks = findInWindow('stick');
await bot.clickWindow(sticks.slot, 0, 0); // pick up sticks
await bot.clickWindow(5, 1, 0); // 1 in slot 5
await bot.clickWindow(8, 1, 0); // 1 in slot 8
await bot.clickWindow(sticks.slot, 0, 0); // put remainder back
await bot.waitForTicks(2);

console.log('Pickaxe result in slot 0:', window.slots[0]?.name);
await bot.clickWindow(0, 0, 1); // shift click to take pickaxe
await bot.waitForTicks(3);

// 2. Craft Wooden Shovel: Plank in 2; Sticks in 5, 8
console.log('Crafting wooden shovel...');
planks = findInWindow('oak_planks');
await bot.clickWindow(planks.slot, 0, 0);
await bot.clickWindow(2, 1, 0);
await bot.clickWindow(planks.slot, 0, 0);
await bot.waitForTicks(2);

sticks = findInWindow('stick');
await bot.clickWindow(sticks.slot, 0, 0);
await bot.clickWindow(5, 1, 0);
await bot.clickWindow(8, 1, 0);
await bot.clickWindow(sticks.slot, 0, 0);
await bot.waitForTicks(2);

console.log('Shovel result in slot 0:', window.slots[0]?.name);
await bot.clickWindow(0, 0, 1);
await bot.waitForTicks(3);

// 3. Craft Wooden Sword: Planks in 2, 5; Stick in 8
console.log('Crafting wooden sword...');
planks = findInWindow('oak_planks');
await bot.clickWindow(planks.slot, 0, 0);
await bot.clickWindow(2, 1, 0);
await bot.clickWindow(5, 1, 0);
await bot.clickWindow(planks.slot, 0, 0);
await bot.waitForTicks(2);

sticks = findInWindow('stick');
if (sticks && sticks.count > 0) {
  await bot.clickWindow(sticks.slot, 0, 0);
  await bot.clickWindow(8, 1, 0);
  await bot.clickWindow(sticks.slot, 0, 0);
  await bot.waitForTicks(2);
  console.log('Sword result in slot 0:', window.slots[0]?.name);
  await bot.clickWindow(0, 0, 1);
  await bot.waitForTicks(3);
}

// Close window
bot.closeWindow(window);
await bot.waitForTicks(5);

// Retrieve crafting table
console.log('Retrieving crafting table...');
await bot.dig(tableBlock);
await bot.waitForTicks(5);
await globalThis.collectDrops(4);

// Equip sword
const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) {
  await bot.equip(sword, 'hand');
  console.log('Equipped sword!');
}

console.log('Tools crafted! Inventory:');
for (const i of bot.inventory.items()) console.log(`- ${i.name} x${i.count}`);

bot.chat("Equipped with wooden pickaxe, shovel, and sword. Starting site work at (40, 79, -21)!");

return { items: bot.inventory.items().map(i => `${i.name}x${i.count}`) };
