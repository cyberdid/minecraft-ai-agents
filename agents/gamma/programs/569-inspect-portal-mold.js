// programs/569-inspect-portal-mold.js
console.log('=== INSPECT PORTAL MOLD AT (299, 72, -54) ===');
const moldBlocks = [
  { name: 'bottom', pos: new Vec3(299, 71, -54) },
  { name: 'west', pos: new Vec3(298, 72, -54) },
  { name: 'east', pos: new Vec3(300, 72, -54) },
  { name: 'south (front)', pos: new Vec3(299, 72, -53) },
  { name: 'north (back)', pos: new Vec3(299, 72, -55) },
  { name: 'portal center', pos: new Vec3(299, 72, -54) }
];

for (const m of moldBlocks) {
  const b = bot.blockAt(m.pos);
  console.log(`${m.name} at ${lib.fmt(m.pos)}: ${b ? b.name : 'null'}`);
}
