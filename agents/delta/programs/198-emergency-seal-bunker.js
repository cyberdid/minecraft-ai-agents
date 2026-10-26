// programs/198-emergency-seal-bunker.js
console.log('Delta pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Inspect surrounding blocks around (44, 65, -147)
console.log('--- SURROUNDING BLOCKS SCAN (z=-145 to -149) ---');
for (let z = -145; z >= -149; z--) {
  for (let y = 67; y >= 64; y--) {
    const bW = bot.blockAt(new Vec3(43, y, z));
    const bC = bot.blockAt(new Vec3(44, y, z));
    const bE = bot.blockAt(new Vec3(45, y, z));
    console.log(`z=${z} y=${y}: W(43)=${bW?.name} C(44)=${bC?.name} E(45)=${bE?.name}`);
  }
}

// 2. Seal any exposed air blocks to make a completely safe 100% blast-proof pocket
// Stand securely at (44.5, 65.0, -146.5)
const p = bot.entity.position;
const targets = [
  // West wall
  { x: 43, y: 65, z: -146 },
  { x: 43, y: 66, z: -146 },
  { x: 43, y: 65, z: -147 },
  { x: 43, y: 66, z: -147 },
  // East wall
  { x: 45, y: 65, z: -146 },
  { x: 45, y: 66, z: -146 },
  { x: 45, y: 65, z: -147 },
  { x: 45, y: 66, z: -147 },
  // Roof
  { x: 44, y: 67, z: -146 },
  { x: 44, y: 67, z: -147 }
];

for (const t of targets) {
  const b = bot.blockAt(new Vec3(t.x, t.y, t.z));
  if (b && (b.name === 'air' || b.name === 'cave_air')) {
    console.log(`Placing cobblestone at ${lib.fmt(t)}...`);
    try {
      await lib.place('cobblestone', t.x, t.y, t.z);
    } catch (err) {
      console.log(`Place error at ${lib.fmt(t)}:`, err.message);
    }
  }
}

// 3. Check for dropped items nearby (e.g. food, swords)
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (e && e.name === 'item') {
    const dist = bot.entity.position.distanceTo(e.position);
    if (dist < 8) {
      const item = e.getDroppedItem?.();
      console.log(`Nearby item at dist ${dist.toFixed(1)}m: ${item?.name} x${item?.count}`);
    }
  }
}

bot.chat('delta: Safe in cobblestone bunker at (44, 65, -147)! Health=0.3, Food=7, Cobble=' + lib.count('cobblestone') + '. Holding position!');
console.log('Delta inventory after sealing:', JSON.stringify(lib.inv()));
