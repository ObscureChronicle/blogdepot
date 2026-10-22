import { useState } from 'react';
import BarChart from '../components/BarChart';
import RadarChart from '../components/RadarChart';
import FiveStringTable from '../components/Table_Traits.jsx';

export default function CharacterAbilitySection({
    baseData,
    basename_short,
    postData,
    prevDataName,
    postDataName,
    attributefigure,
    baseData2,
    postBaseData2,
    traitsBase,
    traitsPost,
    dlcData,
    dlcData2,
    dlcAttributeFigure,
    dlcname_short,
    traitsDLC,
}) {
    const [activeDataType, setActiveDataType] = useState('data');

    // 根据状态选择数据；后期数据缺失时沿用本传（与 rank-data.ts 的「本传2」规则一致）
    const currentRadarData = activeDataType === 'data' ? baseData : postData;
    const currentBarData = activeDataType === 'data' ? baseData2 : (postBaseData2 ?? baseData2);
    const currentTraits = activeDataType === 'data' ? traitsBase : (traitsPost ?? traitsBase);

    return (
        <div className="flex md:flex-row flex-col">
            <div className="flex flex-col items-center">
                <span className="bg-blue-100 text-blue-800 text-base font-medium px-1.5 pt-1 rounded-sm dark:bg-blue-900 dark:text-blue-300">{basename_short}</span>
                {postData && (
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={() => setActiveDataType('data')}
                            className={`cursor-pointer px-2 py-1 rounded text-sm border ${activeDataType === 'data' ? 'bg-gray-400 text-white' : 'bg-white'}`}
                        >
                            {prevDataName}
                        </button>
                        <button
                            onClick={() => setActiveDataType('postdata')}
                            className={`cursor-pointer px-2 py-1 rounded text-sm border ${activeDataType === 'postdata' ? 'bg-gray-400 text-white' : 'bg-white'}`}
                        >
                            {postDataName}
                        </button>
                    </div>
                )}

                {/* 传递计算后的当前数据给子组件 */}
                {/* 不传 postdata，RadarChart 就不会渲染自己的切换按钮，切换统一由上面的按钮负责 */}
                <RadarChart data={currentRadarData} attributefigure={attributefigure} />
                <BarChart data={currentBarData} />
                <FiveStringTable data={currentTraits} />
            </div>
            {dlcData && (
                <div className="flex flex-col items-center">
                    <span className="bg-yellow-100 text-yellow-800 text-base font-medium px-1.5 pt-1 rounded-sm dark:bg-yellow-900 dark:text-yellow-300">
                        {dlcname_short}
                    </span>
                    {postData && <div className='md:mb-[52px]'></div>}
                    <RadarChart variant="dlc" data={dlcData} attributefigure={dlcAttributeFigure} />
                    <BarChart data={dlcData2} />
                    <FiveStringTable data={traitsDLC} />
                </div>
            )}
        </div>
    );
}
