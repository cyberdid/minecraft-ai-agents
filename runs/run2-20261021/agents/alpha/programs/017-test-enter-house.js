console.log('Moving towards house entrance...');
// Entrance is at (12, 67, -21)
await lib.goTo(12, 67, -20, 1);
console.log('Arrived near entrance at:', bot.entity.position);
await lib.goThroughDoor(12, 67, -21);
console.log('Inside house at:', bot.entity.position);
const doorBlock = lib.blockAt(12, 67, -21);
console.log('Door state:', doorBlock ? doorBlock.getProperties() : 'no door');
