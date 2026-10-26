// programs/171-place-floor-z138.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Planks available:', lib.count('birch_planks'));

// 1. Walk right behind the slit at (44, 65, -134)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -134));
} catch (e) {}

console.log('Positioned at slit:', lib.fmt(bot.entity.position));

// 2. Check current block at (44, 64, -138)
const current138 = bot.blockAt(new Vec3(44, 64, -138));
console.log('Block at (44, 64, -138) before:', current138?.name);

// 3. Place birch_planks at (44, 64, -138) attached to (44, 64, -137)
if (!current138 || current138.name === 'air' || current138.name === 'cave_air') {
  try {
    console.log('Placing floor block at (44, 64, -138)...');
    const res = await lib.place('birch_planks', 44, 64, -138);
    console.log('Place result:', res);
  } catch (err) {
    console.log('Place error:', err.message);
  }
}

// 4. Verify block at (44, 64, -138)
const verified = bot.blockAt(new Vec3(44, 64, -138));
console.log('Block at (44, 64, -138) after:', verified?.name);

// 5. Step back to center of tunnel at (44, 65, -133)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -133));
} catch (e) {}

// 6. Equip weapon
await lib.equipWeapon();
console.log('Pos final:', lib.fmt(bot.entity.position));
console.log('Delta inventory:', JSON.stringify(lib.inv()));
bot.chat(`delta: Placed bridge floor block at (44, 64, -138) through slit! Floor now extends to z=-138.`);
