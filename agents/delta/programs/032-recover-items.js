// programs/032-recover-items.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time start:', JSON.stringify(lib.time()));

// Death drop is at (295, 27, -29)
const dropPos = new Vec3(295, 27, -29);
console.log('Approaching drop spot at', lib.fmt(dropPos));

try {
  await lib.goTo(dropPos.x, dropPos.y, dropPos.z, 2, { timeoutMs: 15000 });
} catch (e) {
  console.log('Approach drop note:', e.message);
}

// Pickup items
const picked = await lib.pickup(10);
console.log(`Picked up ${picked} items!`);

// Equip weapon and armor
await lib.equipArmor();
await lib.equipWeapon();

console.log('Inv now:', JSON.stringify(lib.inv()));
console.log('Tools now:', JSON.stringify(lib.tools()));

// Retreat 8 blocks up the stairs towards (304, 54, -34)
console.log('Stepping back up toward safer ground (304, 50, -34)...');
try {
  await lib.goTo(304, 50, -34, 3, { timeoutMs: 20000 });
} catch (e) {
  console.log('Retreat note:', e.message);
}

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

bot.chat('delta: Recovered items from drop spot! Standing by on staircase with Gamma & Beta!');
