// 1. Try placing door at doorway (12, 67, -21)
try {
  console.log('Placing oak_door at (12, 67, -21)...');
  await lib.place('oak_door', 12, 67, -21);
  console.log('Door successfully placed!');
} catch (e) {
  console.log('Door place note:', e.message);
}

// 2. Walk towards forest grove in smooth hops
async function hopTo(x, z) {
  console.log(`Hopping to (${x}, ${z})...`);
  await lib.goToXZ(x, z);
  console.log(`Reached (${Math.round(bot.entity.position.x)}, ${Math.round(bot.entity.position.z)})`);
}

await hopTo(45, -55);
await hopTo(85, -85);
await hopTo(130, -110);

console.log('Arrived at forest grove! Bot at:', lib.fmt(bot.entity.position));

// 3. Collect 14 logs with stone axe
console.log('Collecting 14 oak logs...');
const got = await lib.collect('*_log', 14);
console.log('Collected logs:', JSON.stringify(got));

// 4. Craft planks for the roof
console.log('Crafting oak planks...');
await lib.craft('oak_planks', 52);
console.log('Planks now in inventory:', lib.count('oak_planks'));

// 5. Hop back to base
console.log('Returning to base...');
await hopTo(85, -85);
await hopTo(45, -55);
await lib.goTo(10, 67, -25, 2);

console.log('Safely back at base! Bot at:', lib.fmt(bot.entity.position));
console.log('Planks in inventory:', lib.count('oak_planks'));

bot.chat("alpha: Returned with " + lib.count('oak_planks') + " oak planks! Ready to build the roof.");
return lib.status();
