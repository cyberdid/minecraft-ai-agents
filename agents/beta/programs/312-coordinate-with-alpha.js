// programs/312-coordinate-with-alpha.js
console.log('=== Coordinate with Alpha and locate drops ===');

// Check Alpha entity
const alpha = Object.values(bot.entities).find(e => e.type === 'player' && e.username.includes('alpha'));
if (alpha) {
  console.log(`Alpha is at ${lib.fmt(alpha.position)}`);
}

// Find nearby animals outside within 30 blocks
const animals = bot.findBlocks({
  matching: b => false, // we will search entities instead
  maxDistance: 1
});

const passiveEntities = Object.values(bot.entities).filter(e =>
  e.type === 'mob' && ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) < 30
);
console.log(`Found ${passiveEntities.length} animals nearby:`, passiveEntities.map(a => `${a.name} at ${lib.fmt(a.position)}`).join(', '));

// Find any dropped items nearby
const droppedItems = Object.values(bot.entities).filter(e =>
  e.type === 'object' && e.entityType === mcData.entitiesByName.item?.id
);
console.log(`Found ${droppedItems.length} dropped item entities within view.`);

bot.chat('beta: Alpha, are your drops down the shaft at y=18? I have a sword and can help clear mobs/retrieve!');
