// programs/018-check-beta-shaft.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// Report all teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
  else console.log(`Player ${name} far / underground`);
}

// Open door and step out smoothly
const door = bot.blockAt(new Vec3(294, 72, -54));
if (door && door.name.includes('door') && !door.getProperties().open) {
  console.log('Opening door...');
  await bot.activateBlock(door);
  await sleep(250);
}

console.log('Stepping outside...');
await lib.walkTo(294.5, -52);
console.log('Outside at:', lib.fmt(bot.entity.position));

// Close door behind
if (door && bot.blockAt(new Vec3(294, 72, -54)).getProperties().open) {
  await bot.activateBlock(bot.blockAt(new Vec3(294, 72, -54)));
  await sleep(250);
}

// Check portal frame
const portalFrame = lib.shapes.portal(298, 72, -54, 'x');
console.log('Portal materials:', JSON.stringify(lib.materials(portalFrame)));

// Walk towards shaft entrance at (302, 71, -44)
console.log('Walking towards shaft at (302, 71, -44)...');
await lib.goTo(302, 72, -46, 2);

console.log('Now at shaft vicinity:', lib.fmt(bot.entity.position));

// Check teammates again
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
}

bot.chat('delta: Outside at shaft (302, 71, -44). Waiting for Beta with obsidian!');
