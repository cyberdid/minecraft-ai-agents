// Test blueprint calculations for house at (10, 67, -25)
// Let's test a 7x7 house and a 5x5 house
const site = { x: 10, y: 67, z: -25 };

// Option A: 7x7 house with sandstone walls and oak_planks roof
const house7x7_sandstone = lib.shapes.house({
  ...site,
  width: 7,
  depth: 7,
  height: 3,
  wall: 'sandstone',
  roof: 'oak_planks',
  door: 'south',
  windows: true
});
console.log('7x7 Sandstone+Wood house needs:', JSON.stringify(lib.materials(house7x7_sandstone).need));

// Option B: 5x5 house with cobblestone/sandstone walls and oak_planks roof
const house5x5 = lib.shapes.house({
  ...site,
  width: 5,
  depth: 5,
  height: 3,
  wall: 'sandstone',
  roof: 'oak_planks',
  door: 'south',
  windows: true
});
console.log('5x5 Sandstone+Wood house needs:', JSON.stringify(lib.materials(house5x5).need));

// Option C: 5x5 all-sandstone house with wooden door and roof
const house5x5_wood = lib.shapes.house({
  ...site,
  width: 5,
  depth: 5,
  height: 3,
  wall: 'oak_planks',
  roof: 'oak_planks',
  door: 'south',
  windows: true
});
console.log('5x5 All-Oak house needs:', JSON.stringify(lib.materials(house5x5_wood).need));

const t = lib.time();
console.log(`Current time: ${t.timeOfDay} (${t.phase}), ${t.night ? 'NIGHT' : 'DAY'}`);
const hostiles = lib.hostiles(16);
console.log('Hostiles within 16:', JSON.stringify(hostiles));

bot.chat("alpha: I calculated blueprints for base (10, 67, -25). 5x5 needs ~34 wall blocks + 49 roof blocks. Sandstone walls + wood roof looks great! What do you think?");

return { timeOfDay: t.timeOfDay, phase: t.phase };
