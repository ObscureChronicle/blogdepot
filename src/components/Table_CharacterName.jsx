
const thClassName = 'px-2 md:px-4 py-2 text-center bg-gray-100 font-semibold text-gray-800  border-black border-r align-middle last:border-r-0';
const tdClassName = 'px-2 md:px-4 py-2 font-medium text-gray-700 border-b border-gray-200 text-center border-r align-middle';
const ROWS = [
    { key: 'name', label: '名/Name' },
    { key: 'namePronunciation', label: '拼音/注音/読み方/Wade–Giles' },
    { key: 'styledName', label: '字/Styled Name' },
    { key: 'styledNamePronunciation', label: '拼音/注音/読み方/Wade–Giles' },
    { key: 'other', label: '其它/Other' }
];

export default function CharacterNameTable({ data }) {

    return (
        <div className="mx-auto overflow-hidden rounded-lg relative">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className={thClassName}>类别/類別/Type</th>
                        <th className={thClassName}>简化字</th>
                        <th className={thClassName}>繁體字</th>
                        <th className={thClassName}>日本語</th>
                        <th className={thClassName}>English</th>
                    </tr>
                </thead>
                <tbody>
                    {ROWS.map(({ key, label }) => (
                        <tr key={key} className="transition-all duration-200 bg-white">
                            <td className={tdClassName}>{label}</td>
                            <td className={tdClassName}>{data?.[key]?.simplified ?? ''}</td>
                            <td className={tdClassName}>{data?.[key]?.traditional ?? ''}</td>
                            <td className={tdClassName}>{data?.[key]?.japanese ?? ''}</td>
                            <td className={tdClassName}>{data?.[key]?.english ?? ''}</td>
                        </tr>
                    ))}
                    {/*
                    <tr className={`transition-all duration-200 bg-white`}>
                        <td className={tdClassName}>名/Name</td>
                        <td className={tdClassName}>关羽</td>
                        <td className={tdClassName}>關羽</td>
                        <td className={tdClassName}>関羽</td>
                        <td className={tdClassName}>Guan Yu</td>
                    </tr>
                    <tr className={`transition-all duration-200 bg-white`}>
                        <td className={tdClassName}>拼音/注音/読み方 /Wade–Giles</td>
                        <td className={tdClassName}>{}</td>
                        <td className={tdClassName}>{}</td>
                        <td className={tdClassName}>かん　う</td>
                        <td className={tdClassName}>Kuan Yv</td>
                    </tr>
                    <tr className={`transition-all duration-200 bg-white`}>
                        <td className={tdClassName}>字/Styled Name</td>
                        <td className={tdClassName}>关羽</td>
                        <td className={tdClassName}>關羽</td>
                        <td className={tdClassName}>関羽</td>
                        <td className={tdClassName}>Guan Yu</td>
                    </tr>
                    <tr className={`transition-all duration-200 bg-white`}>
                        <td className={tdClassName}>拼音/注音/読み方/Wade–Giles</td>
                        <td className={tdClassName}>关羽</td>
                        <td className={tdClassName}>關羽</td>
                        <td className={tdClassName}>関羽</td>
                        <td className={tdClassName}>Guan Yu</td>
                    </tr>
                    <tr className={`transition-all duration-200 bg-white`}>
                        <td className={tdClassName}>其它/Other</td>
                        <td className={tdClassName}>关羽</td>
                        <td className={tdClassName}>關羽</td>
                        <td className={tdClassName}>関羽</td>
                        <td className={tdClassName}>Guan Yu</td>
                    </tr> */}
                </tbody>
            </table>
        </div>
    );
}
