const feet = bot.entity.position.floored();
console.log('Sealing ceiling above feet:', lib.fmt(feet));

bot.chat("alpha: Right next to you, sealing ceiling with dirt now! Safe for the night.");

// Check 3x3 above feet (y = feet.y + 2) and plug any air block with dirt
const holes = [];
for (let dx = -1; dx <= 1; dx++) {
  for (let dz = -1; dz <= 1; dz++) {
    const p = feet.offset(dx, 2, dz);
    const b = bot.blockAt(p);
    if (!b || b.boundingBox !== 'block') {
      holes.push({ x: p.x, y: p.y, z: p.z, name: 'dirt' });
    }
  }
}

// Also check walls at feet.y and feet.y + 1
for (let dy = 0; dy <= 1; dy++) {
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const p = feet.offset(dx, dy, dz);
    const b = bot.blockAt(p);
    if (!b || b.boundingBox !== 'block') {
      holes.push({ x: p.x, y: p.y, z: p.z, name: 'dirt' });
    }
  }
}

console.log('Holes to plug with dirt:', holes.length);
if (holes.length > 0) {
  const r = await lib.build(holes, { replace: false });
  console.log('Seal result:', JSON.stringify(r));
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
return lib.status();
