const res = []
for (let x = 349; x <= 352; x++) {
  for (let z = -30; z <= -26; z++) {
    const p = new Vec3(x, -54, z)
    const b = bot.blockAt(p)
    res.push({ pos: `${x},-54,${z}`, name: b ? b.name : 'null' })
  }
}
console.log(JSON.stringify(res))
return res
