/**
 * Adds prefix="R$" to all InputField components that have unit="R$/..."
 * but don't already have prefix="R$".
 */
const fs = require('fs')
const path = require('path')

function walkDir(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) results.push(...walkDir(fullPath))
    else if (entry.name.endsWith('.tsx')) results.push(fullPath)
  }
  return results
}

// Find all .tsx files under src/tools/
const toolsDir = path.resolve(__dirname, '..', 'src', 'tools')
const files = walkDir(toolsDir)

let totalModified = 0
let totalAdded = 0

for (const absPath of files) {
  let content = fs.readFileSync(absPath, 'utf8')
  const relPath = path.relative(path.resolve(__dirname, '..'), absPath)

  // Match InputField tags with unit="R$/..." that don't have prefix="R$"
  // We need to find <InputField ... unit="R$/..." ... /> or <InputField ... unit="R$" ... />
  // and add prefix="R$" before the unit prop
  const original = content

  // Pattern: find InputField opening tags that contain unit="R$..." but NOT prefix=
  // We'll do a simpler approach: find lines with unit="R$" and check if the same InputField block has prefix
  const lines = content.split('\n')
  const newLines = []
  let modified = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if this line has unit="R$ (currency unit)
    if (line.includes('unit="R$') && !line.includes('prefix=')) {
      // Look backwards to see if this InputField already has prefix
      let hasPrefix = false
      let j = i - 1
      while (j >= 0 && !lines[j].includes('<InputField') && !lines[j].includes('<SelectField') && !lines[j].includes('<ResultCard')) {
        if (lines[j].includes('prefix=')) {
          hasPrefix = true
          break
        }
        j--
      }

      if (!hasPrefix) {
        // Add prefix="R$" before unit="R$..."
        const newLine = line.replace(/unit="R\$/, 'prefix="R$" unit="R$')
        newLines.push(newLine)
        modified = true
        totalAdded++
        continue
      }
    }
    newLines.push(line)
  }

  if (modified) {
    fs.writeFileSync(absPath, newLines.join('\n'))
    totalModified++
    console.log(`✓ ${relPath}`)
  }
}

console.log(`\nDone: ${totalModified} files modified, ${totalAdded} prefix="R$" added`)
