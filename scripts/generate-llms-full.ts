/**
 * Generates llms-full.txt by inlining all linked markdown files from llms.txt
 *
 * This creates a single file optimized for LLM context injection, following
 * the llms.txt specification (https://llmstxt.org).
 */

import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname, resolve } from "path"

const ROOT_DIR = resolve(dirname(import.meta.url.replace("file://", "")), "..")

function parseLinks(content: string): { path: string; title: string }[] {
  const links: { path: string; title: string }[] = []
  const linkRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/g

  let match
  while ((match = linkRegex.exec(content)) !== null) {
    const [, title, path] = match
    // Only include relative paths (not external URLs)
    if (!path.startsWith("http://") && !path.startsWith("https://")) {
      links.push({ title, path })
    }
  }

  return links
}

function readMarkdownFile(relativePath: string): string | null {
  // Handle paths starting with ./
  const cleanPath = relativePath.replace(/^\.\//, "")
  const fullPath = join(ROOT_DIR, cleanPath)

  if (!existsSync(fullPath)) {
    console.warn(`Warning: File not found: ${fullPath}`)
    return null
  }

  return readFileSync(fullPath, "utf-8")
}

function generateFullContext(): string {
  const llmsTxtPath = join(ROOT_DIR, "llms.txt")

  if (!existsSync(llmsTxtPath)) {
    console.error("Error: llms.txt not found at", llmsTxtPath)
    process.exit(1)
  }

  const llmsTxt = readFileSync(llmsTxtPath, "utf-8")
  const links = parseLinks(llmsTxt)

  // Start with the llms.txt content
  const sections: string[] = [llmsTxt]

  // Add separator
  sections.push("\n---\n")
  sections.push("# Inlined Documentation\n")
  sections.push("The following sections contain the full content of linked documentation files.\n")

  // Inline each linked file
  for (const link of links) {
    const content = readMarkdownFile(link.path)
    if (content) {
      sections.push(`\n---\n`)
      sections.push(`## Source: ${link.path}\n`)
      sections.push(content)
    }
  }

  return sections.join("\n")
}

// Main execution
console.log("Generating llms-full.txt...")

const fullContent = generateFullContext()
const outputPath = join(ROOT_DIR, "llms-full.txt")
writeFileSync(outputPath, fullContent)

console.log(`Generated ${outputPath}`)
console.log(`Size: ${(fullContent.length / 1024).toFixed(1)} KB`)
