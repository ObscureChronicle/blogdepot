
const ROWS = [
    { key: 'name', label: '名/Name' },
    { key: 'namePronunciation', label: '拼音/注音/読み方/Wade–Giles' },
    { key: 'styledName', label: '字/Styled Name' },
    { key: 'styledNamePronunciation', label: '拼音/注音/読み方/Wade–Giles' },
    { key: 'other', label: '其它/Other' }
];

export default function CharacterNameTable({ data }) {

    // 样式见 global.css 的 .wiki-table；多列表格在手机上放在自身容器里横向滚动
    return (
        <div className="mt-2 overflow-x-auto">
            <table className="wiki-table wiki-table--matrix wiki-table--hover not-prose">
                <thead>
                    <tr>
                        <th scope="col">类别/類別/Type</th>
                        <th scope="col">简化字</th>
                        <th scope="col">繁體字</th>
                        <th scope="col">日本語</th>
                        <th scope="col">English</th>
                    </tr>
                </thead>
                <tbody>
                    {ROWS.map(({ key, label }) => (
                        <tr key={key}>
                            <th scope="row">{label}</th>
                            <td>{data?.[key]?.simplified ?? ''}</td>
                            <td>{data?.[key]?.traditional ?? ''}</td>
                            <td>{data?.[key]?.japanese ?? ''}</td>
                            <td>{data?.[key]?.english ?? ''}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
