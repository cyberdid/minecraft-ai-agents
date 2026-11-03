// programs/595-craft-sword-and-mine-cobble.js
console.log('=== Program 595: Craft Sword & Mine Cobblestone ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());

// 1. Craft sticks
if (lib.count('stick') === 0) {
  console.log('Crafting sticks...');
  try {
    await lib.craft('stick', 4);
  } catch (e) {
    console.log('Stick craft note:', e.message);
  }
}
console.log('Inv after sticks:', lib.inv());

// 2. Craft wooden pickaxe if needed
if (lib.count('*pickaxe') === 0) {
  console.log('Crafting wooden pickaxe...');
  try {
    await lib.craft('wooden_pickaxe', 1);
  } catch (e) {
    console.log('Wooden pickaxe craft note:', e.message);
  }
}
console.log('Inv after wooden pickaxe:', lib.inv());

// 3. Mine 5 cobblestone for stone pickaxe + stone sword
if (lib.count('cobblestone') < 5 && lib.count('*pickaxe') > 0) {
  console.log('Collecting cobblestone for stone tools...');
  try {
    await lib.collect('cobblestone', 5);
  } catch (e) {
    console.log('Cobblestone collect note:', e.message);
  }
}
console.log('Inv after initial cobble:', lib.inv());

// 4. Craft stone pickaxe
if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
  console.log('Crafting stone pickaxe...');
  try {
    // ensure sticks
    if (lib.count('stick') < 2 && lib.count('*_planks') >= 2) {
      await lib.craft('stick', 4);
    }
    await lib.craft('stone_pickaxe', 1);
  } catch (e) {
    console.log('Stone pickaxe craft note:', e.message);
  }
}

// 5. Craft stone sword
if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
  console.log('Crafting stone sword...');
  try {
    if (lib.count('stick') < 1 && lib.count('*_planks') >= 2) {
      await lib.craft('stick', 4);
    }
    await lib.craft('stone_sword', 1);
  } catch (e) {
    console.log('Stone sword craft note:', e.message);
  }
}
console.log('Inv after stone tools:', lib.inv());

// 6. Collect 16 more cobblestone for building / bridging
if (lib.count('*pickaxe') > 0) {
  console.log('Collecting 16 building cobblestone...');
  try {
    await lib.collect('cobblestone', 16);
  } catch (e) {
    console.log('Building cobble note:', e.message);
  }
}

await lib.equipWeapon();
console.log('Final inventory:', lib.inv(), 'Held:', bot.heldItem?.name);
bot.chat(`alpha: Armed with ${bot.heldItem?.name || 'none'} and ${lib.count('cobblestone')} cobble! Ready for Nether assault!`);
