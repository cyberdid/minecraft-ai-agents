// Place crafting table at base (9, 67, -24)
const tableSpot = new Vec3(9, 67, -24);
try {
  await lib.place('crafting_table', tableSpot.x, tableSpot.y, tableSpot.z);
  console.log('Crafting table placed successfully at', lib.fmt(tableSpot));
} catch (e) {
  console.log('Table place note:', e.message);
}

// Craft oak_door (6 oak_planks -> 3 doors)
console.log('Crafting oak_door...');
await lib.craft('oak_door', 1);
console.log('Doors in inventory:', lib.count('oak_door'));

// Chat to alpha
bot.chat("alpha: Placed crafting table at (9, 67, -24) and crafted oak doors. Heading to forest for 14 logs to build roof. Be back in ~85s!");

console.log('Inventory now:', JSON.stringify(lib.inv()));
return lib.status();
