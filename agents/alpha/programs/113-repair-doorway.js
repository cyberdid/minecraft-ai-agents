// programs/113-repair-doorway.js
// 1. Pave cobblestone floor under door at (294, 71, -54)
// 2. Craft oak_door and place at (294, 72, -54)
// 3. Welcome Beta as Beta arrives at base

console.log('Repairing doorway floor at (294, 71, -54)...');
await lib.place('cobblestone', 294, 71, -54);
console.log('Floor at (294, 71, -54) is now:', bot.blockAt(new Vec3(294, 71, -54))?.name);

// Craft door
if (lib.count('oak_door') === 0) {
  if (lib.count('*_planks') < 6 && lib.count('*_log') > 0) {
    await lib.craft('oak_planks', 4);
  }
  await lib.craft('oak_door', 1);
  console.log('Crafted oak_door! Count:', lib.count('oak_door'));
}

// Place door
console.log('Placing oak_door at (294, 72, -54)...');
await lib.place('oak_door', 294, 72, -54);
console.log('Door at (294, 72, -54) is now:', bot.blockAt(new Vec3(294, 72, -54))?.name);

// Open door for Beta
await lib.door(294, 72, -54, true);

bot.chat('alpha: Doorway repaired and door is open for you beta! Base chest has all your gear.');
