// programs/560-inspect-portal-frame.js
console.log('=== INSPECT FULL PORTAL FRAME ===');

for (let y = 71; y <= 77; y++) {
  let row = `y=${y}: `;
  for (let x = 297; x <= 302; x++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    row += `x${x}:${b ? b.name : 'null'} `;
  }
  console.log(row);
}

// Check flint and steel or fire charge in base chest or inventory
console.log(`Delta inv flint_and_steel: ${lib.count('flint_and_steel')}`);
const cBlock = bot.blockAt(new Vec3(293, 72, -57));
if (cBlock) {
  const chest = await bot.openChest(cBlock);
  const items = chest.containerItems().map(i => `${i.name} x${i.count}`);
  console.log('Base chest items:', items.join(', '));
  chest.close();
}
