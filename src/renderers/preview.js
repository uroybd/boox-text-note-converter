import MarkdownRenderer from './markdown'

export default class PreviewRenderer extends MarkdownRenderer {
  blobToDataUrl(blob) {
    return new Promise((r) => {
      let a = new FileReader()
      a.onload = r
      a.readAsDataURL(blob)
    }).then((e) => e.target.result)
  }
  async imageRenderer(content) {
    const path = content.attrs.dataKey.replace(/^\/note\//, '')
    const blobContent = this.assets.find((a) => a.name == path).content
    let url = await this.blobToDataUrl(blobContent)

    // mimetype from path:
    const mimeType = path.split('.').pop()
    url = url.replace('data:application/octet-stream', `data:image/png`)
    return `![${content.attrs.alt}](${url})\n`
  }
}
