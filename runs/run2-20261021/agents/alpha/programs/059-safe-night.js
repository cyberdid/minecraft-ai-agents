console.log('Night is in', lib.status().secondsUntilNight, 's. Gathering dirt/sand and sealing shelter.');
// Dig 8 sand or sandstone nearby to have blocks
const sand = lib.find('sand', { maxDistance: 4, count: 6 });
for (const b of sand) {
  try {
    await lib.dig(b.position.x, b.position.y, b.position.z);
    await lib.pickup(3);
  } catch(e) {}
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
// Now shelter safely for the night
await lib.shelter();
console.log('Sheltered! Status:', lib.status().pos);
