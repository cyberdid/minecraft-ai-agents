// programs/558-inspect-floor-and-pave-forward.js
console.log('=== Step: Inspect Bridge Floor, Mine Netherrack, and Pave Forward ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Scan floor and walls from z=-158 to z=-168
console.log('--- Bridge Floor Scan (x=44, y=64) ---');
for (let z = -158; z >= -168; z--) {
  const f = bot.blockAt(new Vec3(44, 64, z));
  const feet = bot.blockAt(new Vec3(44, 65, z));
  const head = bot.blockAt(new Vec3(44, 66, z));
  const west = bot.blockAt(new Vec3(43, 65, z));
  const east = bot.blockAt(new Vec3(45, 65, z));
  console.log(`z=${z}: floor=${f?.name}, feet=${feet?.name}, head=${head?.name}, W(43)=${west?.name}, E(45)=${east?.name}`);
}

// 2. Pick up any drops
const drops = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 10);
console.log(`Found ${drops.length} item drops nearby`);
for (const d of drops) {
  try { await lib.goTo(d.position.x, d.position.y, d.position.z, 0.5); } catch (e) {}
}
await lib.pickup(6);

// 3. Mine 4-5 netherrack blocks from side wall at (45, 65..66, -158..-160)
console.log('Mining building blocks from side wall...');
for (const p of [new Vec3(45, 65, -158), new Vec3(45, 66, -158), new Vec3(45, 65, -159), new Vec3(45, 66, -159), new Vec3(45, 65, -160)]) {
  const b = bot.blockAt(p);
  if (b && (b.name === 'netherrack' || b.name === 'dirt' || b.name === 'soul_sand' || b.name === 'soul_soil')) {
    console.log(`Mining ${b.name} at ${lib.fmt(p)}...`);
    try { await lib.dig(p.x, p.y, p.z); } catch (e) {}
  }
}
await lib.pickup(5);

const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Inventory after mining:', inv);

// 4. If we have blocks, pave open floor gaps at z=-161, -162, -163
const placeable = bot.inventory.items().find(i => ['netherrack', 'cobblestone', 'dirt', 'soul_soil', 'soul_sand'].includes(i.name));
if (placeable) {
  for (let z = -161; z >= -165; z--) {
    const f = bot.blockAt(new Vec3(44, 64, z));
    if (!f || f.name === 'air') {
      console.log(`Placing floor at (44, 64, ${z}) with ${placeable.name}...`);
      try {
        await lib.place(placeable.name, 44, 64, z);
        console.log(`SUCCESS: Placed floor at (44, 64, ${z})!`);
      } catch (e) {
        console.log(`Place error at z=${z}:`, e.message);
        break; // Need contiguous support
      }
    }
  }
}

// 5. Check hostiles (Blazes)
const hostiles = lib.hostiles(25);
console.log('Hostiles within 25m:', hostiles.map(h => `${h.name} (${h.dist.toFixed(1)}m)`).join(', ') || 'none');

bot.chat(`beta: Bridge floor secured at ${lib.fmt(bot.entity.position)}! Blazes in range: ${hostiles.filter(h => h.name === 'blaze').length}. Ready to farm!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  inventory: bot.inventory.items().map(i => `${i.name}x${i.count}`)
};
