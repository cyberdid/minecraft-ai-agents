// programs/002-survey-site.js
// Survey terrain near beta at (296, 72, -58) and between alpha and beta

const myPos = bot.entity.position;
console.log('Starting pos:', myPos.x.toFixed(1), myPos.y.toFixed(1), myPos.z.toFixed(1));

// Go up towards beta to see the surface/plateau
await lib.goTo(296, 72, -58, 3);
console.log('Arrived near beta at:', bot.entity.position.x.toFixed(1), bot.entity.position.y.toFixed(1), bot.entity.position.z.toFixed(1));

// Survey a 15x15 area around (295, -60)
const x0 = 290;
const z0 = -65;
const heights = [];
for (let z = z0; z <= z0 + 12; z += 2) {
  let row = `z=${z}: `;
  for (let x = x0; x <= x0 + 12; x += 2) {
    let y = 85;
    while (y > 55 && lib.blockAt(x, y, z).boundingBox !== 'block') y--;
    const blockName = lib.blockAt(x, y, z).name;
    row += `${x}:${y}(${blockName.slice(0, 4)}) `;
  }
  heights.push(row);
}
console.log('Terrain survey:\n' + heights.join('\n'));

// Check for nearby trees or coal
const logs = lib.find('*_log', { maxDistance: 32, count: 5 });
console.log('Nearby logs found:', logs.length);
if (logs.length > 0) {
  console.log('Closest log at:', lib.fmt(logs[0].position));
}

bot.chat(`alpha at (${bot.entity.position.x.toFixed(0)}, ${bot.entity.position.y.toFixed(0)}, ${bot.entity.position.z.toFixed(0)}). Surveying base site.`);
return { pos: bot.entity.position, heights };
