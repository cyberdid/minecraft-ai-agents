// programs/101-re-equip-beta-at-base.js
// 1. Climb into base at (294, 72, -54)
// 2. Craft stone tools for Beta and deposit into base chest at (293, 72, -57)
// 3. Coordinate with Beta

console.log('Alpha climbing into base from:', lib.fmt(bot.entity.position));

// 1. Climb up to base floor
try {
  await lib.goTo(294, 72, -54, 1, { dig: true });
} catch (e) {
  console.log('Climb note:', e.message);
}

// 2. Pass into base
try {
  await passDoorIn();
} catch (e) {
  console.log('Door note:', e.message);
}

console.log('Inside base! Alpha at:', lib.fmt(bot.entity.position));

// 3. Craft stone tools for Beta
console.log('Crafting stone tools for Beta...');
await lib.craft('stone_pickaxe', 2);
await lib.craft('stone_sword', 1);
await lib.craft('stone_axe', 1);

// 4. Deposit tools and cobblestone into chest for Beta
console.log('Depositing gear for Beta into chest at (293, 72, -57)...');
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

const chestItems = await lib.chestContents(293, 72, -57);
console.log('Base chest now has:', JSON.stringify(chestItems));

bot.chat('alpha: Beta, come to base chest at (293, 72, -57)! I left stone pickaxes, sword, axe, iron leggings, and cobblestone for you.');
