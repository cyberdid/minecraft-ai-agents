const list = []
for (let y = -56; y <= -53; y++) {
  for (let x = 348; x <= 352; x++) {
    for (let z = -30; z <= -26; z++) {
      const p = new Vec3(x, y, z)
      const b = bot.blockAt(p)
      if (b && (b.name === 'lava' || b.name === 'water' || b.name === 'obsidian' || b.name === 'air')) {
        list.push({ pos: `${x},${y},${z}`, name: b.name, meta: b.metadata })
      }
    }
  }
}
console.log('Fluid/air blocks in vicinity:')
console.log(JSON.stringify(list, null, 2))
return list
