// programs/074-place-doorstep.js
// Place doorstep at (294, 71, -53) to level the doorway
console.log('Placing doorstep cobblestone at (294, 71, -53)...');
await lib.place('cobblestone', 294, 71, -53);
console.log('Doorstep placed:', bot.blockAt(new Vec3(294, 71, -53))?.name);

// Now test goThroughDoor
console.log('Testing goThroughDoor outside...');
await lib.goThroughDoor(294, 72, -54);
console.log('Outside! Alpha at:', lib.fmt(bot.entity.position));

console.log('Testing goThroughDoor inside...');
await lib.goThroughDoor(294, 72, -54);
console.log('Inside! Alpha at:', lib.fmt(bot.entity.position));
