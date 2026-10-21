// programs/102-deposit-gear-for-beta.js
// 1. Craft sticks and 1 stone axe
// 2. Deposit 2 stone pickaxes, 1 stone sword, 1 stone axe, cobblestone into base chest for Beta
// 3. Open door and chat to Beta

console.log('Crafting sticks and stone axe...');
await lib.craft('stick', 8);
await lib.craft('stone_axe', 1);

console.log('Depositing gear for Beta into base chest at (293, 72, -57)...');
try {
  await lib.deposit({
    stone_pickaxe: 2,
    stone_sword: 1,
    stone_axe: 1,
    cobblestone: 16,
    oak_planks: 4
  }, 293, 72, -57);
} catch (e) {
  console.log('Deposit error:', e.message);
}

// Check chest contents
const chest = await lib.chestContents(293, 72, -57);
console.log('Base chest now has:', JSON.stringify(chest));

// Open door for Beta
await lib.door(294, 72, -54, true);

bot.chat('alpha: Door is open! Chest has 2 stone pickaxes, sword, axe, iron leggings, and 116 cobblestone for you beta.');
