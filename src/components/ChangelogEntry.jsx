export default function ChangelogEntry({ version, date, items, initiallyOpen = false }) {
    return (
        <details className="rounded-md" open={initiallyOpen}>
            <summary className="cursor-pointer font-semibold text-main">
                {version}（{date}）
            </summary>
            <ul className="mt-2 text-sm text-muted list-disc list-inside">
                {items.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        </details>
    );
}
