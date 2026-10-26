// programs/175-inspect-south-approach-and-extinguish.js
console.log('Pos before:', lib.fmt(bot.entity.position));

// Scan z=-120 to -127 at x=43..47 from y=64 to 67 for fire
console.log('--- Inspecting South Approach for Fire Hazards ---');
const fireBlocks = [];
for (let z = -127; z >= -120; z++) {
  for (let x = 43; x <= 47; x++) {
    for (let y = 64; y <= 67; y++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name === 'fire') {
        fireBlocks.push(new Vec3(x, y, z));
        console.log(`FIRE FOUND at (${x}, ${y}, ${z})!`);
      }
    }
  }
}
console.log(`Total fire blocks found: ${fireBlocks.length}`);

// If fire found within reach, punch it out
for (const f of fireBlocks) {
  if (bot.entity.position.distanceTo(f) <= 4.5) {
    try {
      console.log(`Extinguishing fire at ${lib.fmt(f)}...`);
      await lib.dig(f.x, f.y, f.z);
      console.log(`Extinguished fire at ${lib.fmt(f)}!`);
    } catch (e) {
      console.log('Extinguish note:', e.message);
    }
  }
}

// Return safely into hallway
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -130));
} catch (e) {}

// Equip weapon
await lib.equipWeapon();
console.log('Pos final:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
