// programs/007-build-house-now.js
// Walk to base site, craft door/planks, build walls, roof, door, and get inside!

console.log('Navigating to base site (292, 72, -58)...');
await lib.goTo(294, 72, -54, 2);

console.log('Crafting planks and door...');
try {
  await lib.craft('oak_planks', 20);
  console.log('Planks now:', lib.count('oak_planks'));
} catch (e) {
  console.log('Craft planks note:', e.message);
}

try {
  if (lib.count('oak_door') === 0 && lib.count('*_door') === 0) {
    await lib.craft('oak_door', 1);
    console.log('Doors now:', lib.count('oak_door'));
  }
} catch (e) {
  console.log('Craft door note:', e.message);
}

// Generate the house shapes
const site = { x: 292, y: 72, z: -58 };
const house = lib.shapes.house({
  ...site,
  width: 5,
  depth: 5,
  height: 3,
  wall: 'cobblestone',
  roof: 'oak_planks',
  door: 'south',
  windows: false
});

const walls = house.filter(b => b.name === 'cobblestone');
console.log('Walls count:', walls.length);

bot.chat('alpha: Building shelter walls at (292, 72, -58)');
const wallRes = await lib.build(walls, { replace: true });
console.log('Wall build result:', JSON.stringify(wallRes));

// Place the door at (294, 72, -54)
try {
  if (lib.count('*_door') > 0) {
    console.log('Placing door at (294, 72, -54)...');
    await lib.place('oak_door', 294, 72, -54);
    console.log('Door placed');
  }
} catch (e) {
  console.log('Door place note:', e.message);
}

// Build roof
const roof = house.filter(b => b.name === 'oak_planks');
console.log('Roof blocks needed:', roof.length, 'Planks carried:', lib.count('oak_planks'));
if (lib.count('oak_planks') > 0) {
  const roofRes = await lib.build(roof, { replace: false });
  console.log('Roof build result:', JSON.stringify(roofRes));
}

// Get inside the house
try {
  console.log('Entering house through door...');
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside house at:', bot.entity.position.x.toFixed(1), bot.entity.position.y.toFixed(1), bot.entity.position.z.toFixed(1));
} catch (e) {
  console.log('Enter house note:', e.message);
}

// If inside, place crafting table
try {
  if (lib.count('crafting_table') > 0) {
    const spot = await lib.freeSpot();
    if (spot) {
      await lib.place('crafting_table', spot.x, spot.y, spot.z);
      console.log('Crafting table placed at:', lib.fmt(spot));
    }
  }
} catch (e) {
  console.log('Table place note:', e.message);
}

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's | phase:', time.phase);
bot.chat(`alpha inside shelter. Night in ${time.secondsUntilNight}s.`);

return {
  time: time.secondsUntilNight,
  pos: bot.entity.position
};
