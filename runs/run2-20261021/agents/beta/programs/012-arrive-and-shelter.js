console.log('Heading final stretch to base (10, 67, -25)...');
await lib.goTo(10, 67, -25, 2);
console.log('Arrived at base! Bot at:', lib.fmt(bot.entity.position));

const t = lib.time();
console.log(`Time: ${t.timeOfDay} (${t.phase}), night in ${Math.round(t.secondsUntilNight)}s`);

const alpha = bot.players.alpha?.entity;
console.log('Alpha pos:', alpha ? lib.fmt(alpha.position) : 'unknown');

// Craft a chest and door
await lib.craft('oak_door', 1); // crafts 3 doors
await lib.craft('chest', 1);

// Place chest at (10, 67, -23) if possible and deposit tools for alpha
const chestSpot = new Vec3(10, 67, -23);
try {
  await lib.place('chest', chestSpot.x, chestSpot.y, chestSpot.z);
  console.log('Placed chest at', lib.fmt(chestSpot));
  await lib.deposit({ stone_pickaxe: 1, stone_axe: 1 }, chestSpot.x, chestSpot.y, chestSpot.z);
  console.log('Deposited stone tools for alpha!');
  bot.chat("alpha: Placed chest at (10, 67, -23) with stone pickaxe & axe for you!");
} catch (e) {
  console.log('Chest placement note:', e.message);
}

// Build a 3x3 or 4x4 protective shelter box at base
// Floor is y=66 (ground). Walls at y=67, 68. Roof at y=69.
// Corner: x=10..12, z=-26..-24
const shelterBlocks = [];
const mat = lib.count('oak_planks') > 8 ? 'oak_planks' : 'dirt';

for (let y = 67; y <= 68; y++) {
  for (let x = 10; x <= 12; x++) {
    for (let z = -26; z <= -24; z++) {
      const isWall = (x === 10 || x === 12 || z === -26 || z === -24);
      if (isWall) {
        // Doorway at (11, y, -24)
        if (x === 11 && z === -24) continue;
        shelterBlocks.push({ x, y, z, name: mat });
      }
    }
  }
}
// Roof at y=69
for (let x = 10; x <= 12; x++) {
  for (let z = -26; z <= -24; z++) {
    shelterBlocks.push({ x, y, z, name: mat });
  }
}

console.log('Building shelter box...');
try {
  await lib.build(shelterBlocks, { replace: false });
  console.log('Shelter walls and roof built!');
  // Place door at (11, 67, -24)
  try {
    await lib.place('oak_door', 11, 67, -24);
    console.log('Door placed at (11, 67, -24)!');
  } catch (de) {
    console.log('Door place note:', de.message);
  }
} catch (be) {
  console.log('Build note:', be.message);
}

// Step inside the shelter at (11, 67, -25)
try {
  await lib.goTo(11, 67, -25, 0);
  console.log('Safely inside shelter at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Go inside note:', e.message);
}

bot.chat("alpha: Base shelter is ready at (11, 67, -25) with door at (11, 67, -24)! Night is here, get inside!");

return lib.status();
