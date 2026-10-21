const res = []
for (let y = -56; y <= -54; y++) {
  for (let x = 347; x <= 352; x++) {
    for (let z = -30; z <= -26; z++) {
      const p = new Vec3(x, y, z)
      const b = bot.blockAt(p)
      if (b && (b.name === 'lava' || b.name === 'obsidian' || b.name === 'air')) {
        res.push({ p: `${x},${y},${z}`, name: b.name, meta: b.metadata })
      }
    }
  }
}
console.log(JSON.stringify(res, null, 2))
