// programs/065-clear-door-and-chest.js
// 1. Craft oak_planks and chest
// 2. Dig the obstacle crafting_table at (294, 72, -53) so the doorway is clear
// 3. Step back to (294, 72, -56) and place chest at (293, 72, -57)
// 4. Verify chest with lib.chestContents()

console.log('alpha at:', lib.fmt(bot.entity.position));

// 1. Craft planks and chest
await lib.craft('oak_planks', 4);
console.log('Planks count:', lib.count('*_planks'));
await lib.craft('chest', 1);
console.log('Chest count:', lib.count('chest'));

// 2. Remove blocking crafting table in front of door
const blockAt53 = bot.blockAt(new Vec3(294, 72, -53));
console.log('Block at (294, 72, -53):', blockAt53 ? blockAt53.name : 'null');
if (blockAt53 && blockAt53.name === 'crafting_table') {
  console.log('Digging obstacle crafting_table at (294, 72, -53)...');
  await lib.dig(294, 72, -53);
  await lib.pickup(4);
}

// Ensure door at (294, 72, -54) is closed or open as needed
const doorBlock = bot.blockAt(new Vec3(294, 72, -54));
console.log('Door state:', doorBlock ? doorBlock.name : 'null');

// 3. Step to base interior (294, 72, -56)
await lib.walkTo(294, -56);

// Close door if open
try {
  await lib.door(294, 72, -54, false);
} catch (e) {
  console.log('Door close note:', e.message);
}

// 4. Place chest at (293, 72, -57)
console.log('Placing chest at (293, 72, -57)...');
const chestSpot = bot.blockAt(new Vec3(293, 72, -57));
console.log('Chest spot current block:', chestSpot ? chestSpot.name : 'null');
if (chestSpot && chestSpot.name === 'air') {
  await lib.place('chest', 293, 72, -57);
}
console.log('Chest placed! Spot is now:', bot.blockAt(new Vec3(293, 72, -57)).name);

const chestContents = await lib.chestContents();
console.log('Chest contents:', JSON.stringify(chestContents));

bot.chat('alpha: Cleared doorway and placed base chest at (293, 72, -57)!');
