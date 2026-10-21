// programs/018-re-equip-from-chest.js
// Enter base, check chest, re-equip, craft new tools

console.log('alpha respawned at:', lib.fmt(bot.entity.position));

// 1. Enter base
const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Walking inside...');
await lib.walkTo(294, -56);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}

// 2. Check chest contents
const chestPos = { x: 293, y: 72, z: -57 };
let contents = {};
try {
  contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(contents));
} catch (e) {
  console.log('Chest error:', e.message);
}

// Withdraw useful items
const toWithdraw = {};
['oak_planks', 'oak_log', 'cobblestone', 'stick', 'stone_pickaxe', 'wooden_pickaxe', 'apple', 'oak_door'].forEach(k => {
  if (contents[k]) toWithdraw[k] = contents[k];
});

if (Object.keys(toWithdraw).length > 0) {
  console.log('Withdrawing:', JSON.stringify(toWithdraw));
  await lib.withdraw(toWithdraw, chestPos.x, chestPos.y, chestPos.z);
}

// Check inventory
console.log('Inventory now:', JSON.stringify(lib.inv()));

// If we need tools and have wood/stone:
if (lib.count('*_pickaxe') === 0) {
  if (lib.count('*_planks') >= 3 && lib.count('stick') >= 2) {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Crafted wooden_pickaxe');
  }
}

bot.chat('alpha: Respawned at base. Chest checked. Ready to gear up and continue.');

const time = lib.time();
console.log('Time until night:', time.secondsUntilNight, 's');

return {
  chest: contents,
  inv: lib.inv(),
  time: time.secondsUntilNight
};
