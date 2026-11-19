import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildClassConditions, extractBaseClassRelations } from '../src/utils/class-relations.ts';

test('extractBaseClassRelations: Layout_Classes reads top-level props', () => {
    const raw = "<ClassWiki\n  parents={['戟兵']}\n  upgrades={[]}\n/>";
    assert.deepEqual(extractBaseClassRelations(raw), { parents: ['戟兵'], upgrades: [], condition: [] });
});

test('extractBaseClassRelations: Layout_ClassesPlus only reads the base section', () => {
    const raw =
        "<ClassWiki\n  base={{\n    parents: [],\n    upgrades: ['重装刀兵', \"虎兵\"],\n  }}\n  dlc={{\n    parents: ['虎贲营印绶'],\n    upgrades: ['方阵'],\n  }}\n/>";
    assert.deepEqual(extractBaseClassRelations(raw), { parents: [], upgrades: ['重装刀兵', '虎兵'], condition: [] });
});

test('extractBaseClassRelations: a file with only dlc / collab sections has no base relations', () => {
    const raw = "<ClassWiki\n  dlc={{\n    parents: ['印绶'],\n    upgrades: ['方阵'],\n  }}\n/>";
    assert.deepEqual(extractBaseClassRelations(raw), { parents: [], upgrades: [], condition: [] });
});

test('extractBaseClassRelations: reads the base condition, not the 星命诀 one', () => {
    const raw = "<ClassWiki\n  base={{\n    parents: ['发石车'],\n    condition: ['智略≥90'],\n  }}\n  dlc={{\n    condition: ['解锁条件'],\n  }}\n/>";
    assert.deepEqual(extractBaseClassRelations(raw).condition, ['智略≥90']);
});

test('buildClassConditions: maps titles to conditions, skipping classes without one', () => {
    const files = {
        'a.mdx': "---\ntitle: 长矛骑\n---\n<ClassWiki condition={['武勇≥85', '胆识≥4']} />",
        'b.mdx': '---\ntitle: 贼兵\n---\n<ClassWiki condition={[]} />'
    };
    assert.deepEqual(buildClassConditions(files), { 长矛骑: ['武勇≥85', '胆识≥4'] });
});
