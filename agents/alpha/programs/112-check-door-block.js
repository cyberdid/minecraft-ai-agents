// programs/112-check-door-block.js
console.log('Block at (294, 72, -54):', bot.blockAt(new Vec3(294, 72, -54))?.name);
console.log('Block at (294, 73, -54):', bot.blockAt(new Vec3(294, 73, -54))?.name);
console.log('Block at (294, 71, -54):', bot.blockAt(new Vec3(294, 71, -54))?.name);

const chest = await lib.chestContents();
console.log('Chest has doors:', chest.oak_door);
