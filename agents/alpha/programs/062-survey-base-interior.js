// programs/062-survey-base-interior.js
// Inspect the base interior blocks and identify ideal spots for chest and extra furnace

for (let y = 72; y <= 74; y++) {
  console.log(`--- Layer y=${y} ---`);
  for (let z = -58; z <= -53; z++) {
    let row = `z=${z}: `;
    for (let x = 292; x <= 296; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      row += `(${x}):${b ? b.name : 'air'} `;
    }
    console.log(row);
  }
}
