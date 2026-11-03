// programs/690-inspect-obsidian-frame.js
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

const obsidian = bot.findBlocks({ matching: b => b && b.name === 'obsidian', maxDistance: 32, count: 20 });
console.log(`Found ${obsidian.length} obsidian blocks:`, obsidian.map(p => lib.fmt(p)));

const portalBlocks = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 64, count: 10 });
console.log(`Found ${portalBlocks.length} nether_portal blocks:`, portalBlocks.map(p => lib.fmt(p)));
