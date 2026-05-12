
export default function(html, size) {
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const plainText = doc.body.textContent
    const text = plainText.replace(/[\r\n]+/g, ' ')
    const head = text.substring(0, size)

    return head
}
