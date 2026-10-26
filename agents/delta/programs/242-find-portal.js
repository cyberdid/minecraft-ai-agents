// programs/242-find-portal.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

const portals = bot.findBlocks({ matching: b => b.name === 'nether_portal', maxDistance: 15, count: 20 });
console.log('Portals found:', portals.map(p => lib.fmt(p)));

const obsidians = bot.findBlocks({ matching: b => b.name === 'obsidian', maxDistance: 15, count: 20 });
console.log('Obsidians found:', obsidians.map(p => lib.fmt(p)));
