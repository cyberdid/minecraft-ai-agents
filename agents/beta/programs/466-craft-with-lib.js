// programs/466-craft-with-lib.js
console.log('=== Step: Craft Tools using lib.craft ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Craft sticks
if (lib.count('stick') < 4) {
  try {
    await lib.craft('stick', 2); // 2 crafts = 8 sticks
    console.log(`Crafted sticks! Total: ${lib.count('stick')}`);
  } catch (e) {
    console.log('Craft stick error:', e.message);
  }
}

// 2. Craft wooden pickaxe
if (lib.count('wooden_pickaxe') === 0 && lib.count('stick') >= 2) {
  try {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Crafted wooden_pickaxe!');
  } catch (e) {
    console.log('Craft wooden_pickaxe error:', e.message);
  }
}

// 3. Craft wooden sword
if (lib.count('wooden_sword') === 0 && lib.count('stick') >= 1) {
  try {
    await lib.craft('wooden_sword', 1);
    console.log('Crafted wooden_sword!');
  } catch (e) {
    console.log('Craft wooden_sword error:', e.message);
  }
}

console.log('Inv now:', JSON.stringify(lib.inv()));
bot.chat(`beta: Tools crafted! Inv: ${JSON.stringify(lib.inv())}`);
