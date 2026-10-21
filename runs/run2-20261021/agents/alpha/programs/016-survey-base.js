// Check cobblestone/stone/coal
const coal = lib.find('coal_ore', { maxDistance: 32, count: 5 });
const stone = lib.find('stone', { maxDistance: 16, count: 5 });
const sandstone = lib.find('sandstone', { maxDistance: 16, count: 5 });
const chest = lib.find('chest', { maxDistance: 32, count: 2 });
const craftingTable = lib.find('crafting_table', { maxDistance: 32, count: 2 });

console.log('Coal ore:', coal.map(c => lib.fmt(c.position)));
console.log('Stone:', stone.map(s => lib.fmt(s.position)));
console.log('Sandstone:', sandstone.map(s => lib.fmt(s.position)));
console.log('Chests:', chest.map(c => lib.fmt(c.position)));
console.log('Crafting tables:', craftingTable.map(c => lib.fmt(c.position)));

// Check beta's position if beta is online
const beta = bot.players['beta']?.entity;
if (beta) {
  console.log(`Beta is at (${beta.position.x.toFixed(1)}, ${beta.position.y.toFixed(1)}, ${beta.position.z.toFixed(1)})`);
} else {
  console.log('Beta entity not in vision / offline');
}
