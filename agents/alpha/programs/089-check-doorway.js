// programs/089-check-doorway.js
console.log('Door props:', JSON.stringify(bot.blockAt(new Vec3(294, 72, -54))?.getProperties()));
console.log('Block at (294, 72, -53):', bot.blockAt(new Vec3(294, 72, -53))?.name);
console.log('Block at (294, 71, -53):', bot.blockAt(new Vec3(294, 71, -53))?.name);
console.log('Entities near door:', Object.values(bot.entities).filter(e => e.position.distanceTo(new Vec3(294, 72, -54)) < 4).map(e => `${e.name} at ${lib.fmt(e.position)}`));
