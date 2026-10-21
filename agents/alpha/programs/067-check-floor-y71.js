// programs/067-check-floor-y71.js
// Check the floor at y=71 from x=292..296, z=-58..-54

for (let z = -58; z <= -54; z++) {
  let row = `z=${z}: `;
  for (let x = 292; x <= 296; x++) {
    const b = bot.blockAt(new Vec3(x, 71, z));
    row += `(${x}):${b ? b.name : 'air'} `;
  }
  console.log(row);
}
