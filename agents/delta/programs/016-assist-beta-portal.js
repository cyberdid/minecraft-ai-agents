// programs/016-assist-beta-portal.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

// Check base chest
const chestPos = new Vec3(293, 72, -57);
const chestContents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chestContents));

// Check portal frame materials
const portalFrame = lib.shapes.portal(298, 72, -54, 'x');
const mats = lib.materials(portalFrame);
console.log('Portal materials:', JSON.stringify(mats));

// Check if nether_portal block exists
const portalBlocks = bot.findBlocks({ matching: b => b.name === 'nether_portal', maxDistance: 16, count: 1 });
console.log('Nether portal blocks active:', portalBlocks.length);

bot.chat('delta: Standing guard inside base by door (294, 72, -54). Bed 2 ready for Beta! Ready to ignite portal at (298, 72, -54)!');
