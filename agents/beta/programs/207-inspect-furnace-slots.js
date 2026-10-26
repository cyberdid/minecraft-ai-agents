const fBlock = bot.blockAt(new Vec3(295, 72, -55))
const f = await bot.openFurnace(fBlock)
console.log('Furnace slots:')
for (let i = 0; i < 3; i++) {
  const item = f.slots[i]
  console.log(`Slot ${i}:`, item ? `${item.name} x${item.count}` : 'empty')
}
// Also check cursor item
console.log('Cursor item:', bot.inventory.cursor ? `${bot.inventory.cursor.name} x${bot.inventory.cursor.count}` : 'empty')
f.close()
