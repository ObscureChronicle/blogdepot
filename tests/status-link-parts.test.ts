import { test } from 'node:test';
import assert from 'node:assert/strict';
import { linkStatusNames, linkStatusTokens } from '../src/utils/status-link-parts.ts';

const links: Record<string, string> = {
    高昂: '/projects/status/gaoang/',
    低落: '/projects/status/diluo/',
    混乱: '/projects/status/luanzhen/',
    疲惫: '/projects/status/pibi/'
};
const resolve = (name: string) => links[name] ?? null;

test('linkStatusTokens: 每个空白分隔的词单独解析，保留空白', () => {
    assert.deepEqual(linkStatusTokens('高昂 低落', resolve), [
        { text: '高昂', href: '/projects/status/gaoang/' },
        { text: ' ' },
        { text: '低落', href: '/projects/status/diluo/' }
    ]);
});

test('linkStatusTokens: 未命中的词回退到状态总览', () => {
    assert.deepEqual(linkStatusTokens('所有不良状态', resolve, '/projects/status/00_status/'), [
        { text: '所有不良状态', href: '/projects/status/00_status/' }
    ]);
});

test('linkStatusTokens: 没有回退地址时保持纯文本', () => {
    assert.deepEqual(linkStatusTokens('所有不良状态', resolve), [{ text: '所有不良状态' }]);
});

test('linkStatusNames: 只把句中内嵌的状态名变成链接', () => {
    assert.deepEqual(linkStatusNames('攻击时小概率附加混乱状态', ['混乱'], resolve), [
        { text: '攻击时小概率附加' },
        { text: '混乱', href: '/projects/status/luanzhen/' },
        { text: '状态' }
    ]);
});

test('linkStatusNames: 多个状态名按最长优先匹配', () => {
    assert.deepEqual(linkStatusNames('附加疲惫状态与高昂状态', ['高昂', '疲惫'], resolve), [
        { text: '附加' },
        { text: '疲惫', href: '/projects/status/pibi/' },
        { text: '状态与' },
        { text: '高昂', href: '/projects/status/gaoang/' },
        { text: '状态' }
    ]);
});

test('linkStatusNames: 没有命中时返回整段纯文本', () => {
    assert.deepEqual(linkStatusNames('回合开始前完全恢复兵力', ['高昂', '低落'], resolve), [{ text: '回合开始前完全恢复兵力' }]);
});
