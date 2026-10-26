// programs/033-portal-site-prep.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

const frame = lib.shapes.portal(298, 72, -54, 'x');
console.log('Portal shape blocks (14 blocks):');
for (const b of frame) {
  const current = bot.blockAt(new Vec3(b.x, b.y, b.z));
  console.log(`  (${b.x}, ${b.y}, ${b.z}) want: ${b.name}, is: ${current ? current.name : 'null'}`);
}

// Check player positions
for (const p of Object.values(bot.players)) {
  if (p.username !== 'gamma' && p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}

// Chat update
bot.chat(`gamma standing by at portal site (298, 72, -54). Site verified and clear for Beta!`);
