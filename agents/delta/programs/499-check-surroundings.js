// programs/499-check-surroundings.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

const p = bot.entity.position.floored();
console.log('Block at feet:', bot.blockAt(p)?.name);
console.log('Block below feet:', bot.blockAt(p.offset(0, -1, 0))?.name);
console.log('Block at head:', bot.blockAt(p.offset(0, 1, 0))?.name);

for (const [dx, dz, dir] of [[0, 1, 'South (+Z)'], [0, -1, 'North (-Z)'], [1, 0, 'East (+X)'], [-1, 0, 'West (-X)']]) {
  const f = bot.blockAt(p.offset(dx, 0, dz));
  const u = bot.blockAt(p.offset(dx, 1, dz));
  const b = bot.blockAt(p.offset(dx, -1, dz));
  console.log(`${dir}: below=${b?.name}, waist=${f?.name}, head=${u?.name}`);
}

return { pos: bot.entity.position };
