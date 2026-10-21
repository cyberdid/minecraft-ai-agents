// programs/099-pickup-exact-items.js
// Find and pick up all dropped item entities around (290, 52, -55)

console.log('alpha at:', lib.fmt(bot.entity.position));

const dropped = Object.values(bot.entities).filter(e => (e.name === 'item' || e.displayName === 'Item') && e.position.distanceTo(bot.entity.position) < 16);
console.log('Dropped item entities found:', dropped.length);

for (const it of dropped) {
  console.log(`Item entity at ${lib.fmt(it.position)}`);
  try {
    await lib.goTo(it.position.x, it.position.y, it.position.z, 0.5);
  } catch (e) {
    console.log('Pickup move note:', e.message);
  }
}

await lib.pickup(8);

try {
  await lib.equipArmor();
} catch (e) {}

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Alpha pos:', lib.fmt(bot.entity.position));
