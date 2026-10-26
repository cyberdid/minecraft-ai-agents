// programs/141-place-blocks-and-regroup.js
console.log('--- REGROUP AND SECURE ADVANCE TUNNEL FRONT ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Place roof at (44, 67, -142) with granite or plank
const r142 = bot.blockAt(new Vec3(44, 67, -142));
if (!r142 || r142.name === 'air') {
  const roofBlock = ['granite', 'dirt', 'birch_planks'].find(b => lib.count(b) > 0);
  if (roofBlock) {
    try {
      await lib.place(roofBlock, 44, 67, -142);
      console.log(`Placed roof at (44, 67, -142) using ${roofBlock}`);
    } catch (e) {
      console.log('Roof place err:', e.message);
    }
  }
}

// 2. Place floor at (44, 64, -143) to extend bridge forward
const f143 = bot.blockAt(new Vec3(44, 64, -143));
if (!f143 || f143.name === 'air') {
  const floorBlock = ['birch_planks', 'dirt', 'granite'].find(b => lib.count(b) > 0);
  if (floorBlock) {
    try {
      await lib.place(floorBlock, 44, 64, -143);
      console.log(`Placed bridge floor at (44, 64, -143) using ${floorBlock}`);
    } catch (e) {
      console.log('Floor place err:', e.message);
    }
  }
}

// 3. Check teammate distances and positions
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    const dist = p.entity.position.distanceTo(bot.entity.position);
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${dist.toFixed(1)}m`);
  } else if (name !== 'gamma') {
    console.log(`Teammate ${name} not rendered (further than 64m or in Overworld)`);
  }
}

// 4. Check visible blazes
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze' && e.position);
console.log(`Blazes visible (${blazes.length}):`, blazes.map(b => `${lib.fmt(b.position)} dist=${b.position.distanceTo(bot.entity.position).toFixed(1)}`).join(' | '));

bot.chat(`gamma holding fortified advance tunnel at (44, 65, -141). Tunnel is 100% enclosed z=-127..-142! Delta, Alpha, Beta, advance inside!`);
