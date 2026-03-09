export function renderMd(text) {
    if (!text) return null
    return text.split('\n').map((line, li) => {
        const parts = line.split(/\*\*(.+?)\*\*/g)
        return (
            <span key={li}>
                {parts.map((part, pi) =>
                    pi % 2 === 1 ? <strong key={pi}>{part}</strong> : part
                )}
                {li < text.split('\n').length - 1 && <br />}
            </span>
        )
    })
}
