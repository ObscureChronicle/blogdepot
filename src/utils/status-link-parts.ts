/** 一段文本拆成纯文本与链接片段后的结构 */
export type StatusTextPart = {
    text: string;
    href?: string;
};

/** 空白分隔符（含全角空格），保留原样输出 */
const WHITESPACE = /^[\s　]+$/;

/**
 * 空白分隔的状态列表：逐词解析为词条链接，未命中的词使用 fallbackHref（如状态总览）。
 * 例：`高昂 低落` → 两个状态链接；`所有不良状态` → 总览链接。
 */
export function linkStatusTokens(value: string, resolve: (name: string) => string | null, fallbackHref?: string): StatusTextPart[] {
    return value
        .split(/([\s　]+)/)
        .filter((part) => part !== '')
        .map((part) => {
            if (WHITESPACE.test(part)) return { text: part };
            const href = resolve(part) ?? fallbackHref;
            return href ? { text: part, href } : { text: part };
        });
}

/**
 * 句子中内嵌的状态名：按最长优先匹配状态名，其余文字保持纯文本。
 * `names` 需按长度降序排列，避免短名抢先匹配。
 * 例：`攻击时小概率附加混乱状态` → `攻击时小概率附加` + 链接「混乱」+ `状态`。
 */
export function linkStatusNames(value: string, names: string[], resolve: (name: string) => string | null): StatusTextPart[] {
    const parts: StatusTextPart[] = [];
    let buffer = '';

    for (let index = 0; index < value.length; ) {
        const hit = names.find((name) => name.length > 0 && value.startsWith(name, index));
        if (!hit) {
            buffer += value[index];
            index += 1;
            continue;
        }

        if (buffer) {
            parts.push({ text: buffer });
            buffer = '';
        }
        parts.push({ text: hit, href: resolve(hit) ?? undefined });
        index += hit.length;
    }

    if (buffer) parts.push({ text: buffer });
    return parts;
}
