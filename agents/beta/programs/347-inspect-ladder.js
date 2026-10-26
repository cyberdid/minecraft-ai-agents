// programs/347-inspect-ladder.js
console.log('=== Inspect (303, y, -43) from y=30 to y=71 ===');

for (let y = 30; y <= 72; y++) {
  const b = bot.blockAt(new Vec3(303, y, -43));
  const b2 = bot.blockAt(new Vec3(302, y, -44));
  if (b && b.name !== 'air' && b.name !== 'cave_air') {
    console.log(`y=${y}: (303,-43)=${b.name}, (302,-44)=${b2 ? b2.name : 'null'}`);
  }
}
