// Check what is under each obsidian block
const b = bot
const obsList = [
  new Vec3(349, -55, -29),
  new Vec3(348, -55, -31),
  new Vec3(348, -55, -32),
  new Vec3(348, -55, -29),
  new Vec3(347, -55, -31),
  new Vec3(347, -55, -32),
  new Vec3(347, -55, -30),
  new Vec3(346, -55, -31),
  new Vec3(346, -55, -32),
  new Vec3(346, -55, -30),
  new Vec3(345, -55, -31),
  new Vec3(345, -55, -32),
  new Vec3(344, -55, -32)
]

for (const p of obsList) {
  const under = b.blockAt(p.offset(0, -1, 0))?.name
  const north = b.blockAt(p.offset(0, 0, -1))?.name
  const south = b.blockAt(p.offset(0, 0, 1))?.name
  const east = b.blockAt(p.offset(1, 0, 0))?.name
  const west = b.blockAt(p.offset(-1, 0, 0))?.name
  console.log(`Obsidian at ${p}: under=${under}, surrounding: [${north}, ${south}, ${east}, ${west}]`)
}
