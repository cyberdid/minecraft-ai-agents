// programs/069-clean-inventory.js
// Deposit clutter items into base chest at (293, 72, -57) and craft 2 spare stone pickaxes

console.log('Cleaning inventory into base chest...');
const toDeposit = {
  egg: 'all',
  diorite: 'all',
  granite: 'all',
  andesite: 'all',
  arrow: 'all',
  feather: 'all',
  bone: 'all',
  gravel: 'all',
  birch_sapling: 'all',
  dirt: 'all',
  wooden_pickaxe: 'all',
  cobblestone: 100
};

try {
  await lib.deposit(toDeposit, 293, 72, -57);
} catch (e) {
  console.log('Deposit error:', e.message);
}

// Craft 2 spare stone pickaxes
await lib.craft('stone_pickaxe', 2);

console.log('Inventory now:', JSON.stringify(lib.inv()));
const chestItems = await lib.chestContents(293, 72, -57);
console.log('Chest items now:', JSON.stringify(chestItems));
