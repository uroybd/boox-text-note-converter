export default class BaseRenderer {
  constructor(content, assets, options = {}) {
    this.content = content
    this.assets = assets
    this.options = options
  }

  paragraphRenderer(content) {
    throw new Error('Not implemented')
  }

  headerRenderer(content) {
    throw new Error('Not implemented')
  }

  bulletListRenderer(content, level = 0) {
    throw new Error('Not implemented')
  }

  orderedListRenderer(content, level = 0) {
    throw new Error('Not implemented')
  }

  async imageRenderer(content) {
    throw new Error('Not implemented')
  }

  inlineContentRenderer(content) {
    const innerContent = content
      .map((item) => {
        switch (item.type) {
          case 'text':
            return this.inlineStyleRenderer(item)
          case 'onyximage':
            return this.imageRenderer(item.content, this.options.assets)
          default:
            throw new Error(`Unknown type: ${item.type}`)
        }
      })
      .join('')
    return innerContent
  }

  inlineStyleRenderer(content) {
    throw new Error('Not implemented')
  }

  attachmentsRenderer(content) {
    throw new Error('Not implemented')
  }

  async render() {
    const rendered = await Promise.all(
      this.content.content.content.map(async (item) => {
        switch (item.type) {
          case 'paragraph':
            return this.paragraphRenderer(item)
          case 'heading':
            return this.headerRenderer(item)
          case 'bulletList':
          case 'customBulletList':
            return this.bulletListRenderer(item)
          case 'orderedList':
          case 'customOrderedList':
            return this.orderedListRenderer(item)
          case 'onyxImg':
            return await this.imageRenderer(item)
          case 'attach':
            return this.attachmentsRenderer(item)
          default:
            console.log(`Unknown type: ${item.type}`)
            console.log(item)
        }
      })
    )

    return rendered.join('\n')
  }
}
