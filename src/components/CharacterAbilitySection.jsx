import { useState } from 'react';
import RadarChart from '../components/RadarChart';
import BarChart from '../components/BarChart';
import FiveStringTable from '../components/Table_Traits.jsx';

export default function CharacterAbilitySection({
    baseData,
    postData,
    prevDataName,
    postDataName,
    attributefigure,
    baseData2,
    postBaseData2,
    traitsBase,
    traitsPost
}) {
    const [activeDataType, setActiveDataType] = useState('data');

    // 根据状态选择数据
    const currentRadarData = activeDataType === 'data' ? baseData : postData;
    const currentBarData = activeDataType === 'data' ? baseData2 : postBaseData2;
    const currentTraits = activeDataType === 'data' ? traitsBase : traitsPost;

    return (
        <div className="flex flex-col items-center">
            {postData && (
                <div className="flex justify-end gap-2 mt-4 mb-[-50px]">
                    <button
                        onClick={() => setActiveDataType('data')}
                        className={`px-2 py-1 rounded text-sm border ${activeDataType === 'data' ? 'bg-gray-400 text-white' : 'bg-white'}`}
                    >
                        {prevDataName}
                    </button>
                    <button
                        onClick={() => setActiveDataType('postdata')}
                        className={`px-2 py-1 rounded text-sm border ${activeDataType === 'postdata' ? 'bg-gray-400 text-white' : 'bg-white'}`}
                    >
                        {postDataName}
                    </button>
                </div>
            )}

            {/* 传递计算后的当前数据给子组件 */}
            <RadarChart
                data={currentRadarData}
                attributefigure={attributefigure}
                hideButtons={true} // 告诉雷达图不要再显示自己的按钮了
            />
            <BarChart data={currentBarData} />
            <FiveStringTable data={currentTraits} />
        </div>
    );
}
