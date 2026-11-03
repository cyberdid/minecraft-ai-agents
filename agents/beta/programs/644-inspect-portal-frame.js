for (let dx = -2; dx <= 2; dx++) {
  for (let dy = -1; dy <= 3; dy++) {
    for (let dz = -2; dz <= 2; dz++) {
      const p = new Vec3(299 + dx, 73 + dy, -54 + dz);
      const b = bot.blockAt(p);
      if (b && b.name !== 'air') {
        console.log(`(${p.x}, ${p.y}, ${p.z}): ${b.name}`);
      }
    }
  }
}
