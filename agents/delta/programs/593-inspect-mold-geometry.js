console.log('=== INSPECT MOLD GEOMETRY ===');
for (let dx = -1; dx <= 1; dx++) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dz = -1; dz <= 1; dz++) {
      const pos = new Vec3(299 + dx, 72 + dy, -54 + dz);
      const b = bot.blockAt(pos);
      console.log(`(${pos.x}, ${pos.y}, ${pos.z}): ${b ? b.name : 'null'}`);
    }
  }
}
bot.chat('delta: Team, does anyone have 1 obsidian or a lava bucket to complete sill (299, 72, -54)? I have flint & steel ready to ignite!');
