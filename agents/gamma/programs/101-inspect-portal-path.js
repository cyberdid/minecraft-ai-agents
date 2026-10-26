// programs/101-inspect-portal-path.js
console.log('--- INSPECTING PORTAL BLOCKS AND PATH ---');
for (let x = 295; x <= 302; x++) {
  for (let y = 72; y <= 76; y++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    if (b && b.name !== 'air') {
      console.log(`Block at (${x}, ${y}, -54): ${b.name}`);
    }
  }
}
// Also check adjacent z=-53 and z=-55
for (let x = 295; x <= 302; x++) {
  const b1 = bot.blockAt(new Vec3(x, 72, -53));
  const b2 = bot.blockAt(new Vec3(x, 72, -55));
  console.log(`Ground at x=${x}: z=-53 is ${b1?.name}, z=-55 is ${b2?.name}`);
}
