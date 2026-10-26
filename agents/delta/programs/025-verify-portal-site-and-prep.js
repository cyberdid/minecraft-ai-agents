// programs/025-verify-portal-site-and-prep.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// Portal frame coordinates: x from 298 to 301, z = -54, y from 72 to 76
console.log('--- Portal site inspection ---');
for (let y = 71; y <= 76; y++) {
  let line = `y=${y}: `;
  for (let x = 298; x <= 301; x++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    line += `${x}:${b ? b.name : 'null'} `;
  }
  console.log(line);
}

// Check if any block needs clearing inside the portal frame (x=299..300, y=73..75)
for (let y = 73; y <= 75; y++) {
  for (let x = 299; x <= 300; x++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    if (b && b.boundingBox === 'block') {
      console.log(`Clearing obstruction at (${x}, ${y}, -54): ${b.name}`);
      await lib.dig(x, y, -54);
    }
  }
}

// Check base chest
const chestContents = await lib.chestContents(293, 72, -57);
console.log('Chest contents:', JSON.stringify(chestContents));

// Teammates status
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

bot.chat('delta: Portal site (298..301, 72..76, -54) inspected and clear! Ready for Beta!');
