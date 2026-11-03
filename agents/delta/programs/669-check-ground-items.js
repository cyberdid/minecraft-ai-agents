console.log('=== CHECK GROUND ITEMS & CHAT ===');
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) <= 8);
console.log(`Ground items nearby: ${items.length}`);
for (const it of items) {
  console.log(`  Item: ${it.name} at ${lib.fmt(it.position)}`);
}
try {
  const picked = await lib.pickup(6.0);
  console.log(`Picked up: ${picked}`);
} catch (e) {}

console.log(`Current inv food:`);
const foods = bot.inventory.items().filter(i => i.name.includes('cooked') || i.name.includes('bread') || i.name.includes('beef') || i.name.includes('pork') || i.name.includes('apple'));
for (const f of foods) {
  console.log(`  ${f.name} x${f.count}`);
}
