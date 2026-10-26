// programs/008-place-portal-cobble.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

const portalFrame = lib.shapes.portal(298, 72, -54, 'x');
const cobbleBlocks = portalFrame.filter(b => b.name === 'cobblestone');
console.log('Cobblestone blocks in frame:', JSON.stringify(cobbleBlocks));

for (const b of cobbleBlocks) {
  const current = bot.blockAt(new Vec3(b.x, b.y, b.z));
  console.log(`Block at (${b.x}, ${b.y}, ${b.z}): ${current ? current.name : 'null'}`);
}

// Exit through door to portal site
const doorPos = new Vec3(294, 72, -54);
await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);

// Build whatever portal blocks we can (the 2 cobblestone)
const res = await lib.build(cobbleBlocks);
console.log('Build cobble result:', JSON.stringify(res));

// Check status of portal frame now
console.log('Portal materials now:', JSON.stringify(lib.materials(portalFrame)));

// Step back inside base or stay near portal
await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
bot.chat('delta: Placed cobblestone corners for portal frame! Ready for Beta\'s 10 obsidian.');
