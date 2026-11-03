// programs/713-check-food-and-regear.js
console.log('=== Program 713: Food Check & Hunt ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

const animals = Object.values(bot.entities).filter(e => {
  return e.isValid && ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) && bot.entity.position.distanceTo(e.position) <= 40;
});
console.log(`Found ${animals.length} animals within 40m:`);
for (const a of animals) {
  console.log(`- ${a.name} at ${lib.fmt(a.position)}, dist: ${bot.entity.position.distanceTo(a.position).toFixed(1)}m`);
}

// If animals nearby, hunt 2 of them
if (animals.length > 0) {
  const targetType = animals[0].name;
  console.log(`Hunting ${targetType}...`);
  try {
    await lib.hunt(targetType, Math.min(animals.length, 3));
    console.log('Hunt complete!');
  } catch (e) {
    console.log('Hunt note:', e.message);
  }
}

// Smelt any raw meat
const rawMeat = bot.inventory.items().find(i => i.name.startsWith('raw_') || i.name === 'beef' || i.name === 'mutton' || i.name === 'porkchop' || i.name === 'chicken');
if (rawMeat) {
  console.log(`Smelting ${rawMeat.name} x${rawMeat.count}...`);
  try {
    await lib.smelt(rawMeat.name, 'birch_planks', rawMeat.count);
    console.log('Smelted food successfully!');
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

console.log('Inv after food check:', JSON.stringify(lib.inv()));
