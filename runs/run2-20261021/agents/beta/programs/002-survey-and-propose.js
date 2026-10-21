// Survey terrain around spawn to find a flat area for a 5x5 or 7x7 house
const logs = lib.find('*_log', { maxDistance: 64, count: 5 });
const stone = lib.find('stone', { maxDistance: 64, count: 5 });
const coal = lib.find('coal_ore', { maxDistance: 64, count: 5 });

console.log('Nearby logs:', logs.length > 0 ? lib.fmt(logs[0].position) : 'none');
console.log('Nearby stone:', stone.length > 0 ? lib.fmt(stone[0].position) : 'none');
console.log('Nearby coal:', coal.length > 0 ? lib.fmt(coal[0].position) : 'none');

// Let's check ground heights around (10, -25) to (20, -15)
const x0 = 10, z0 = -25;
const grid = [];
for (let z = z0; z <= z0 + 8; z += 2) {
  let row = `z=${z}: `;
  for (let x = x0; x <= x0 + 8; x += 2) {
    let y = 80;
    while (y > 55 && lib.blockAt(x, y, z).boundingBox !== 'block') y--;
    row += `(${x},${y}) `;
  }
  grid.push(row);
}
console.log('Elevation samples:\n' + grid.join('\n'));

bot.chat("alpha: I suggest we build a 7x7 house near (10, 67, -25). I will gather 8 logs and stone for tools and walls!");

return { logsCount: logs.length, stoneCount: stone.length };
