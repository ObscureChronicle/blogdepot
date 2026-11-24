import { useState } from 'react';
import BarChart from '../components/BarChart';
import DataToggle from '../components/DataToggle';
import RadarChart from '../components/RadarChart';
import FiveStringTable from '../components/Table_Traits.jsx';
import { editionBadgeClass } from '../data/editions';

/**
 * @typedef {{ name?: string, data: number[], data2: number[], traits: string[], figure?: number[] }} BaseForm
 *   本传的一个形态（如曹操「奋武将军」「魏武挥鞭」）；只有一个形态时 name 可省略。
 *   figure 是各属性的上限加成（雷达图属性名变色、悬停显示「统御上限+4」），省略则不显示
 */

/**
 * 人物词条的能力区：本传一栏（多形态时上方的按钮同时切换雷达图、柱状图和特质表）+ 星命诀一栏。
 * 两栏各自可缺省（背景人物两栏都没有时，BiographyLayout 不会渲染本组件）。
 *
 * @param {{
 *   baseForms?: BaseForm[],
 *   basename_short: string,
 *   dlcData?: number[],
 *   dlcData2?: number[],
 *   dlcAttributeFigure?: number[],
 *   dlcname_short: string,
 *   traitsDLC?: string[],
 *   traitLevels?: Record<string, number>
 * }} props
 */
export default function CharacterAbilitySection({ baseForms = [], basename_short, dlcData, dlcData2, dlcAttributeFigure, dlcname_short, traitsDLC, traitLevels = {} }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const current = baseForms[activeIndex];
    const toggleOptions = baseForms.map((form, i) => ({ value: String(i), label: form.name ?? `形态${i + 1}` }));
    const hasToggle = baseForms.length > 1;

    return (
        <div className="flex justify-evenly sm:flex-row flex-col">
            {current && (
                <div className="flex flex-col items-center">
                    <span className={editionBadgeClass('base')}>{basename_short}</span>
                    {hasToggle && <DataToggle className="mt-2" options={toggleOptions} value={String(activeIndex)} onChange={(v) => setActiveIndex(Number(v))} />}
                    <RadarChart data={current.data} attributefigure={current.figure} />
                    <BarChart data={current.data2} />
                    <FiveStringTable data={current.traits} traitLevels={traitLevels} />
                </div>
            )}
            {dlcData && (
                <div className="flex flex-col items-center">
                    <span className={editionBadgeClass('dlc')}>{dlcname_short}</span>
                    {/* 两栏并排时，用一份不可见的同款按钮占位，让星命诀的图表和本传对齐（按钮换行时高度也一致） */}
                    {current && hasToggle && (
                        <div aria-hidden="true" className="invisible hidden sm:block">
                            <DataToggle className="mt-2" options={toggleOptions} value={String(activeIndex)} onChange={() => {}} />
                        </div>
                    )}
                    <RadarChart variant="dlc" data={dlcData} attributefigure={dlcAttributeFigure} />
                    <BarChart data={dlcData2} />
                    <FiveStringTable data={traitsDLC} traitLevels={traitLevels} />
                </div>
            )}
        </div>
    );
}
