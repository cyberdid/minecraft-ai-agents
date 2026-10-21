// programs/126-find-nearest-food.js
// Find the fastest food source (nearest animal or apple leaves)

console.log('alpha at:', lib.fmt(bot.entity.position), '| food:', bot.food);

// 1. Check animals
const animals = ['cow', 'chicken', 'sheep', 'pig'];
let nearestAnimal = null;
let minAnimalDist = 999;

for (const a of animals) {
  const ents = Object.values(bot.entities).filter(e => e.name === a);
  for (const e of ents) {
    const d = e.position.distanceTo(bot.entity.position);
    console.log(`Found ${a} at ${lib.fmt(e.position)} (dist: ${Math.round(d)})`);
    if (d < minAnimalDist) {
      minAnimalDist = d;
      nearestAnimal = e;
    }
  }
}

// 2. Check nearby oak leaves
const leaves = bot.findBlocks({
  matching: mcData.blocksByName.oak_leaves?.id,
  maxDistance: 16,
  count: 30
});
console.log('Nearby oak leaves count:', leaves.length);

console.log('Nearest animal:', nearestAnimal ? `${nearestAnimal.name} at ${lib.fmt(nearestAnimal.position)} (dist: ${Math.round(minAnimalDist)})` : 'none');
bot.chat(`alpha: Nearest food is ${nearestAnimal ? nearestAnimal.name : 'leaves'} at distance ${Math.round(minAnimalDist)}m. Gathering food.`);
