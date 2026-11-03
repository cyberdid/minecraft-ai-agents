globalThis.isProgramCancelled = isCancelled;

const p = bot.entity.position;
console.log(`Current pos: ${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`);

// Inspect nearby blocks
for (let y = 65; y <= 68; y++) {
  let row = `y=${y}: `;
  for (let x = 34; x <= 38; x++) {
    for (let z = -189; z <= -185; z++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && b.name !== 'air' && b.name !== 'cave_air') {
        row += `(${x},${z}:${b.name}) `;
      }
    }
  }
  console.log(row);
}

const blazes = Object.values(bot.entities)
  .filter(e => e.name === 'blaze' && e.isValid)
  .map(e => ({ dist: bot.entity.position.distanceTo(e.position).toFixed(1), pos: e.position.floored(), hp: e.health }));
console.log("Blazes nearby:", JSON.stringify(blazes));

return { pos: bot.entity.position, blazes: blazes.length };
