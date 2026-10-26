// programs/163-craft-tools-and-mine-stone.js
console.log('--- CRAFT TOOLS & MINE STONE ---');
console.log('Current pos:', lib.fmt(bot.entity.position));
console.log('Inventory:', JSON.stringify(lib.inv()));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Craft sticks & wooden pickaxe
console.log('Crafting sticks and wooden pickaxe...');
await lib.craft('stick', 12);
await lib.craft('wooden_pickaxe', 1);
console.log('Wooden pickaxe crafted!');
console.log('Tools:', JSON.stringify(lib.tools()));

// 2. Collect 24 stone (cobblestone)
console.log('Collecting 24 stone...');
const stoneReport = await lib.collect('stone', 24);
console.log('Stone collected:', JSON.stringify(stoneReport));
console.log('Cobblestone count:', lib.count('cobblestone'));

// 3. Craft stone tools
console.log('Crafting stone tools...');
await lib.craft('stone_pickaxe', 2);
await lib.craft('stone_sword', 1);
await lib.craft('stone_axe', 1);
await lib.equipWeapon();
console.log('Stone tools crafted! Tools now:', JSON.stringify(lib.tools()));

// 4. Collect 16 dirt
if (lib.count('dirt') < 16) {
  console.log('Collecting dirt...');
  await lib.collect('dirt', 16 - lib.count('dirt'));
  console.log('Dirt count now:', lib.count('dirt'));
}

// 5. Check if coal_ore nearby (up to 32 blocks)
const coalBlocks = lib.find('coal_ore', { maxDistance: 32, count: 5 });
if (coalBlocks.length > 0 && lib.time().secondsUntilNight > 150) {
  console.log(`Found ${coalBlocks.length} coal_ore nearby! Collecting coal...`);
  try {
    await lib.collect('coal_ore', Math.min(coalBlocks.length, 6));
    console.log('Coal count:', lib.count('coal'));
    if (lib.count('coal') > 0) {
      await lib.craft('torch', 8);
      console.log('Crafted torches! Torch count:', lib.count('torch'));
    }
  } catch (e) {
    console.log('Coal collect note:', e.message);
  }
}

// 6. Return to base before dusk
console.log('Returning to base at (294, 72, -53)...');
await lib.goTo(294, 72, -53, 1);
await lib.goThroughDoor(294, 72, -54);
console.log('Safely inside base at:', lib.fmt(bot.entity.position));

console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Final time:', JSON.stringify(lib.time()));

bot.chat(`gamma equipped with stone sword, stone pickaxes, ${lib.count('cobblestone')} cobble, ${lib.count('dirt')} dirt! Inside base.`);
