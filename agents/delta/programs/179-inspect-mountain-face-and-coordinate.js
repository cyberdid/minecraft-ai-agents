// programs/179-inspect-mountain-face-and-coordinate.js
console.log('Pos before:', lib.fmt(bot.entity.position));

// 1. Look at Alpha
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  await bot.lookAt(alpha.position.offset(0, 1.6, 0), true);
  console.log('Alpha pos:', lib.fmt(alpha.position), 'held:', alpha.heldItem?.name);
}

// 2. Chat with Alpha
bot.chat('delta: Welcome Alpha! Delta has no food, but hallway is 100% blast-proof. Rest safely at (44, 65, -132). Bridge floor is 100% complete to z=-140!');

// 3. Inspect mountain face at z=-140 and z=-141
console.log('--- Mountain face inspection at z=-140 and -141 ---');
for (let z = -140; z >= -141; z--) {
  for (let y = 64; y <= 72; y++) {
    for (let x = 43; x <= 45; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        console.log(`Block at (${x}, ${y}, ${z}): ${b.name}`);
      }
    }
  }
}

// 4. Position firmly inside tunnel
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -133));
} catch (e) {}

// 5. Equip weapon
await lib.equipWeapon();
console.log('Pos final:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
