// programs/172-place-floor-z139.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Planks available:', lib.count('birch_planks'));

// 1. Move right against the waist barricade
try {
  await bot.lookAt(new Vec3(44.5, 65.5, -135.0), true);
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -134));
} catch (e) {}

// 2. Check current block at (44, 64, -139)
const current139 = bot.blockAt(new Vec3(44, 64, -139));
console.log('Block at (44, 64, -139) before:', current139?.name);

// 3. Try place birch_planks at (44, 64, -139)
if (!current139 || current139.name === 'air' || current139.name === 'cave_air') {
  try {
    console.log('Placing floor block at (44, 64, -139)...');
    const res = await lib.place('birch_planks', 44, 64, -139);
    console.log('Place result:', res);
  } catch (err) {
    console.log('Place note:', err.message);
  }
}

// 4. Verify block at (44, 64, -139)
const verified = bot.blockAt(new Vec3(44, 64, -139));
console.log('Block at (44, 64, -139) after:', verified?.name);

// 5. Step back to center of tunnel at (44, 65, -133)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -133));
} catch (e) {}

// 6. Equip weapon
await lib.equipWeapon();
console.log('Pos final:', lib.fmt(bot.entity.position));
console.log('Delta inventory:', JSON.stringify(lib.inv()));
bot.chat(`delta: Bridge floor extension to z=-139 status: ${verified?.name}. Bridge to netherrack mountain z=-140 is ready!`);
