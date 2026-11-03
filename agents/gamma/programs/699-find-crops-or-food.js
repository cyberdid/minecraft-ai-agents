// programs/699-find-crops-or-food.js
const crops = bot.findBlocks({
  matching: b => b && ['wheat', 'carrots', 'potatoes', 'sweet_berry_bush', 'beetroots'].includes(b.name),
  maxDistance: 32,
  count: 10
});

console.log(`Found ${crops.length} crops nearby:`);
for (const cp of crops) {
  const b = bot.blockAt(cp);
  console.log(`Crop ${b?.name} (metadata=${b?.metadata}) at ${lib.fmt(cp)}`);
}
