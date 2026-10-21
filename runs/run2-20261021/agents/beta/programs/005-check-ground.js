const underFeet = lib.blockAt(Math.floor(bot.entity.position.x), Math.floor(bot.entity.position.y) - 1, Math.floor(bot.entity.position.z));
console.log('Block under feet:', underFeet ? underFeet.name : 'none');

// Also check what biome we are in, and what blocks are around
const nearbyBlocks = {};
for (let dx = -5; dx <= 5; dx += 2) {
  for (let dz = -5; dz <= 5; dz += 2) {
    const b = lib.blockAt(Math.floor(bot.entity.position.x) + dx, Math.floor(bot.entity.position.y) - 1, Math.floor(bot.entity.position.z) + dz);
    if (b) nearbyBlocks[b.name] = (nearbyBlocks[b.name] || 0) + 1;
  }
}
console.log('Ground block types nearby:', JSON.stringify(nearbyBlocks));
