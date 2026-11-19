/**
 * 人物词条 baseForms（本传各形态数据）的原文解析（纯函数）
 *
 * 人物 MDX 的本传数据写成：
 *   baseForms={[
 *     { name: '奋武将军', data: [90, 85, 84, 95, 93], data2: [8, 9], traits: ['中原', '明候'] },
 *     { name: '魏武挥鞭', data: [100, 85, 79, 97, 93], data2: [8, 9], traits: ['中原', '霸者'] }
 *   ]}
 * 排行榜、特性持有人等构建时数据直接读 MDX 原文，不经过 Astro 渲染，所以需要在这里解析。
 * 数组内容保留原文（如 "90, 85"），数值怎么容错由调用方决定。
 */

export interface RawBaseForm {
    /** 形态名（切换按钮文字）；只有一个形态时可以省略 */
    name?: string;
    /** data 数组内部原文，缺失为 undefined */
    data?: string;
    /** data2 数组内部原文，缺失为 undefined */
    data2?: string;
    /** 特性列表 */
    traits: string[];
}

/**
 * 从 start（指向某个开括号）开始找到与之配对的闭括号下标；字符串里的括号不计。
 * 找不到返回 -1。
 */
function findClosing(text: string, start: number): number {
    const open = text[start];
    const close = open === '[' ? ']' : open === '{' ? '}' : '';
    if (!close) return -1;
    let depth = 0;
    let quote: string | null = null;
    for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (quote) {
            if (ch === '\\') i++;
            else if (ch === quote) quote = null;
            continue;
        }
        if (ch === "'" || ch === '"' || ch === '`') quote = ch;
        else if (ch === open) depth++;
        else if (ch === close && --depth === 0) return i;
    }
    return -1;
}

function stringList(inner: string): string[] {
    return [...inner.matchAll(/(['"])(.*?)\1/g)].map((s) => s[2].trim()).filter(Boolean);
}

/** 读取对象原文里 key: [...] 的数组内部原文 */
function arrayField(obj: string, key: string): string | undefined {
    const m = obj.match(new RegExp(`\\b${key}\\s*:\\s*\\[([^\\]]*)\\]`));
    return m ? m[1] : undefined;
}

/**
 * 解析 baseForms。没有该属性返回 undefined；属性存在但括号不配对时抛错（不静默忽略）。
 */
export function extractBaseForms(raw: string): RawBaseForm[] | undefined {
    const m = /\bbaseForms\s*=\s*\{\s*\[/.exec(raw);
    if (!m) return undefined;
    const arrStart = m.index + m[0].length - 1;
    const arrEnd = findClosing(raw, arrStart);
    if (arrEnd === -1) throw new Error('baseForms 的方括号没有配对');
    const body = raw.slice(arrStart + 1, arrEnd);

    const forms: RawBaseForm[] = [];
    for (let i = 0; i < body.length; i++) {
        if (body[i] !== '{') continue;
        const end = findClosing(body, i);
        if (end === -1) throw new Error('baseForms 里的花括号没有配对');
        const obj = body.slice(i + 1, end);
        const name = obj.match(/\bname\s*:\s*(['"])(.*?)\1/);
        const traits = arrayField(obj, 'traits');
        forms.push({
            name: name ? name[2] : undefined,
            data: arrayField(obj, 'data'),
            data2: arrayField(obj, 'data2'),
            traits: traits === undefined ? [] : stringList(traits)
        });
        i = end;
    }
    return forms;
}
