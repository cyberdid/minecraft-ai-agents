const portalBlocks = bot.findBlocks({
  matching: mcData.blocksByName.nether_portal ? mcData.blocksByName.nether_portal.id : () => false,
  maxDistance: 6
});
console.log('Nether portal blocks found:', portalBlocks);

const obsidianBlocks = bot.findBlocks({
  matching: mcData.blocksByName.obsidian.id,
  maxDistance: 6
});
console.log('Obsidian blocks found:', obsidianBlocks);
console.log('Current bot position:', bot.entity.position);
