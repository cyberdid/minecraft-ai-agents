bot.chat("alpha: Grass biome is 30 blocks North at z=-55. Heading there for wood and dirt.");

console.log('Heading towards (5, 63, -55)...');
await lib.goTo(5, 63, -55, 3);
console.log('Arrived near grass at:', lib.fmt(bot.entity.position));

// Now search for logs nearby
const nearbyLogs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 64,
  count: 10
}).filter(p => p.y >= 60);

console.log('Surface logs found near grass:', nearbyLogs.length);
if (nearbyLogs.length > 0) {
  console.log('Collecting logs...');
  const got = await lib.collect('*_log', 8);
  console.log('Collected logs:', JSON.stringify(got));
} else {
  // Check leaves or explore further north
  const leaves = bot.findBlocks({
    matching: b => b.name.endsWith('_leaves'),
    maxDistance: 64,
    count: 10
  });
  console.log('Leaves nearby:', leaves.length);
  if (leaves.length > 0) {
    console.log('Nearest leaves at:', lib.fmt(leaves[0]));
    await lib.goTo(leaves[0].x, leaves[0].y, leaves[0].z, 4);
    const got = await lib.collect('*_log', 6);
    console.log('Collected logs:', JSON.stringify(got));
  } else {
    console.log('No trees immediately seen at edge, collecting dirt and looking further.');
    const gotDirt = await lib.collect('grass_block', 16);
    console.log('Collected dirt:', JSON.stringify(gotDirt));
  }
}

return lib.status();
