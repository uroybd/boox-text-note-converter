import BaseRenderer from './base'

export default class MarkdownRenderer extends BaseRenderer {
  paragraphRenderer(content) {
    if (content.content == undefined) {
      return '\n'
    }
    return this.inlineContentRenderer(content.content) + '\n'
  }

  headerRenderer(content) {
    return `${'#'.repeat(content.attrs.level)} ${this.inlineContentRenderer(content.content)}\n`
  }

  bulletListRenderer(content, level = 0) {
    const indentation = '  '.repeat(level)
    const processed = content.content.map((litem, idx) => {
      const innerContents = litem.content.map((item) => {
        switch (item.type) {
          case 'paragraph':
            return this.paragraphRenderer(item)
          case ('orderedList', 'customOrderedList'):
            return this.orderedListRenderer(item, level + 1)
          case ('bulletList', 'customBulletList'):
            return this.bulletListRenderer(item, level + 1)
        }
      })
      innerContents[0] = `${indentation}- ${innerContents[0]}`
      return innerContents.join(`${indentation}  \n`)
    })
    return processed.join('\n').replace(/\n\s*\n/g, '\n') + '\n'
  }

  orderedListRenderer(content, level = 0) {
    const indentation = '  '.repeat(level)
    const processed = content.content.map((litem, idx) => {
      const innerContents = litem.content.map((item) => {
        switch (item.type) {
          case 'paragraph':
            return this.paragraphRenderer(item)
          case 'bulletList':
          case 'customBulletList':
            return this.bulletListRenderer(item, level + 1)
          case 'orderedList':
          case 'customOrderedList':
            return this.orderedListRenderer(item, level + 1)
        }
      })
      innerContents[0] = `${indentation}${idx + 1}. ${innerContents[0]}`
      return innerContents.join(`${indentation}  \n`)
    })

    return processed.join('\n').replace(/\n\s*\n/g, '\n') + '\n'
  }

  async imageRenderer(content) {
    return `![](./${content.attrs.dataKey.split('/').pop()})\n`
  }

  attachmentsRenderer(content) {
    return `[${content.attrs.title}](./${content.attrs.dataKey.split('/').pop()})\n`
  }

  inlineStyleRenderer(content) {
    let text = content.text
    let marks = content.marks || []
    // sort marks by type
    marks = marks.sort((a, b) => {
      if (a.type < b.type) {
        return -1
      }
      if (a.type > b.type) {
        return 1
      }
      return 0
    })
    for (const style of marks) {
      switch (style.type) {
        case 'bold':
          text = `**${text}**`
          break
        case 'italic':
          text = `_${text}_`
          break
        case 'underline':
          text = `<u>${text}</u>`
          break
        case 'link':
          text = `[${text}](${style.attrs.href})`
        default:
          console.log(`Unknown style: ${style.type}`)
      }
    }

    return text
  }
}
