// programs/024-return-to-base.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time start:', JSON.stringify(lib.time()));

// Check for immediate nearby animals
const nearbyAnimals = Object.values(bot.entities).filter(e => 
  ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) && 
  e.position && 
  e.position.distanceTo(bot.entity.position) < 16
);
if (nearbyAnimals.length > 0) {
  console.log('Killing nearby animal for meat:', nearbyAnimals[0].name);
  try {
    await lib.hunt(nearbyAnimals[0].name, 1);
  } catch (e) {
    console.log('Hunt note:', e.message);
  }
}

// Walk back to base
console.log('Walking back to base at (294, 72, -52)...');
await lib.goToXZ(294, -52);

console.log('Pos after XZ trip:', lib.fmt(bot.entity.position));

// Approach portal site
await lib.goTo(298, 72, -52, 2);
console.log('Now at portal site:', lib.fmt(bot.entity.position));

// Check portal frame
const frame = lib.shapes.portal(298, 72, -54, 'x');
console.log('Portal status:', JSON.stringify(lib.materials(frame)));

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

bot.chat('delta: Back at base portal site (298, 72, -54). Ready to assist Beta & Alpha!');
