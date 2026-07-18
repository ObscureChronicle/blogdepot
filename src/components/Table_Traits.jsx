import { useState } from 'react';

// 特质数据表（示例格式，实际使用时可以作为prop传入）
const TraitColor = {
    Oridinary: '#5bae23',
    Super: '#5bae22',
    // Super: '#2775b6',
    Bad: '#de1c31'
}

const TRAIT_MAP = {
    '霸者': { color: TraitColor.Oridinary, link: '/projects/trait/trait_bazhe' },
    '鬼谋': { color: TraitColor.Oridinary, link: '/projects/trait/trait_guimou' },
    '机心': { color: TraitColor.Oridinary, link: '/projects/trait/trait_jixin' },
    '绝伦': { color: TraitColor.Oridinary, link: '/projects/trait/trait_juelun' },
    '内圣': { color: TraitColor.Oridinary, link: '/projects/trait/trait_neisheng' },
    '仁德': { color: TraitColor.Oridinary, link: '/projects/trait/trait_rende' },
    '仁王': { color: TraitColor.Oridinary, link: '/projects/trait/trait_renwang' },
    '曜威': { color: TraitColor.Oridinary, link: '/projects/trait/trait_yaowei' },

    '冰心': { color: TraitColor.Super, link: '/projects/trait/trait_bingxin' },
    '褫夺': { color: TraitColor.Super, link: '/projects/trait/trait_chidu' },
    '雏凤': { color: TraitColor.Super, link: '/projects/trait/trait_chufeng' },
    '摧破': { color: TraitColor.Super, link: '/projects/trait/trait_cuipo' },
    '飞将': { color: TraitColor.Super, link: '/projects/trait/trait_feijiang' },
    '贯午': { color: TraitColor.Super, link: '/projects/trait/trait_guanwu' },
    '国士': { color: TraitColor.Super, link: '/projects/trait/trait_guoshi' },
    '豪桀*': { color: TraitColor.Super, link: '/projects/trait/trait_haojie' },
    '桓武*': { color: TraitColor.Super, link: '/projects/trait/trait_huanwu' },
    '抗音': { color: TraitColor.Super, link: '/projects/trait/trait_kangyin' },
    '雷发': { color: TraitColor.Super, link: '/projects/trait/trait_leifa' },
    '戾极': { color: TraitColor.Super, link: '/projects/trait/trait_liji2' },
    '龙胆': { color: TraitColor.Super, link: '/projects/trait/trait_longdan' },
    '木秀': { color: TraitColor.Super, link: '/projects/trait/trait_muxiu' },
    '逆境': { color: TraitColor.Super, link: '/projects/trait/trait_nijing' },
    '貔貅': { color: TraitColor.Super, link: '/projects/trait/trait_pixiu' },
    '若愚': { color: TraitColor.Super, link: '/projects/trait/trait_ruoyu' },
    '神弓': { color: TraitColor.Super, link: '/projects/trait/trait_shengong' },
    '神恙': { color: TraitColor.Super, link: '/projects/trait/trait_shenyang' },
    '顺平': { color: TraitColor.Super, link: '/projects/trait/trait_shunping' },
    '天予': { color: TraitColor.Super, link: '/projects/trait/trait_tianyu' },
    '同雠': { color: TraitColor.Super, link: '/projects/trait/trait_tongchou2' },
    '卧龙': { color: TraitColor.Super, link: '/projects/trait/trait_wolong' },
    '武库*': { color: TraitColor.Super, link: '/projects/trait/trait_wuku' },
    '陷阵': { color: TraitColor.Super, link: '/projects/trait/trait_xianzhen' },
    '虓阚': { color: TraitColor.Super, link: '/projects/trait/trait_xiaokan' },
    '心涟': { color: TraitColor.Super, link: '/projects/trait/trait_xinlian' },
    '玄音': { color: TraitColor.Super, link: '/projects/trait/trait_xuanyin' },
    '柱石': { color: TraitColor.Super, link: '/projects/trait/trait_zhushi' },
    '准望': { color: TraitColor.Super, link: '/projects/trait/trait_zhunwang' },

    '傲上': { color: TraitColor.Bad, link: '/projects/trait/trait_aoshang' },
    '跋扈': { color: TraitColor.Bad, link: '/projects/trait/trait_bahu' },
    '粗疏': { color: TraitColor.Bad, link: '/projects/trait/trait_cushu' },
    '短虑': { color: TraitColor.Bad, link: '/projects/trait/trait_duanlü' },
    '高慢': { color: TraitColor.Bad, link: '/projects/trait/trait_gaoman' },
    '功名': { color: TraitColor.Bad, link: '/projects/trait/trait_gongming' },
    '横暴': { color: TraitColor.Bad, link: '/projects/trait/trait_hengbao' },
    '荒悖': { color: TraitColor.Bad, link: '/projects/trait/trait_huangbei' },
    '骄惰': { color: TraitColor.Bad, link: '/projects/trait/trait_jiaoduo' },
    '桀犬': { color: TraitColor.Bad, link: '/projects/trait/trait_jiedian' },
    '矜高': { color: TraitColor.Bad, link: '/projects/trait/trait_jingao' },
    '狷狭': { color: TraitColor.Bad, link: '/projects/trait/trait_juanxia' },
    '狼顾': { color: TraitColor.Bad, link: '/projects/trait/trait_langgu' },
    '靡费': { color: TraitColor.Bad, link: '/projects/trait/trait_mifei' },
    '怯懦': { color: TraitColor.Bad, link: '/projects/trait/trait_qienuo' },
    '轻佻': { color: TraitColor.Bad, link: '/projects/trait/trait_qingtiao' },
    '铜臭': { color: TraitColor.Bad, link: '/projects/trait/trait_tongxiu' },
    '无谋': { color: TraitColor.Bad, link: '/projects/trait/trait_wumou' },
    '庸弱': { color: TraitColor.Bad, link: '/projects/trait/trait_yongruo' },
    '愚鲁': { color: TraitColor.Bad, link: '/projects/trait/trait_yulu' },
    '自矜': { color: TraitColor.Bad, link: '/projects/trait/trait_zijin' },
    '恣睢': { color: TraitColor.Bad, link: '/projects/trait/trait_zisui' },

    '巴蜀': { link: '/projects/trait/trait_bashu' },
    '关陇': { link: '/projects/trait/trait_guanzhong' },
    '关中': { link: '/projects/trait/trait_guanzhong' },
    '河北': { link: '/projects/trait/trait_hebei' },
    '淮泗': { link: '/projects/trait/trait_huaisi' },
    '荆楚': { link: '/projects/trait/trait_jingyang' },
    '荆扬': { link: '/projects/trait/trait_jingyang' },
    '青徐': { link: '/projects/trait/trait_qingxu' },
    '吴越': { link: '/projects/trait/trait_wuyue' },
    '西凉': { link: '/projects/trait/trait_yongliang' },
    '雍凉': { link: '/projects/trait/trait_yongliang' },
    '幽并': { link: '/projects/trait/trait_youbing' },
    '中原': { link: '/projects/trait/trait_zhongyuan' },

    '持重': { link: '/projects/trait/trait_chizhong' },
    '赤心': { link: '/projects/trait/trait_chixin' },
    '冲粹': { link: '/projects/trait/trait_chongcui' },
    '处下': { link: '/projects/trait/trait_chuxia' },
    '摧锋': { link: '/projects/trait/trait_cuifeng' },
    '大族': { link: '/projects/trait/trait_dazu' },
    '当先': { link: '/projects/trait/trait_dangxian' },
    '毒士': { link: '/projects/trait/trait_dushi' },
    '反间': { link: '/projects/trait/trait_fanjian' },
    '冯河': { link: '/projects/trait/trait_fenghe' },
    '辅弼': { link: '/projects/trait/trait_fubi' },
    '富国': { link: '/projects/trait/trait_fuguo' },
    '刚胆': { link: '/projects/trait/trait_gangdan' },
    '刚烈': { link: '/projects/trait/trait_ganglie' },
    '高义': { link: '/projects/trait/trait_gaoyi' },
    '骨鲠': { link: '/projects/trait/trait_gugeng' },
    '诡道': { link: '/projects/trait/trait_guidao2' },
    '鬼道': { link: '/projects/trait/trait_guidao' },
    '悍勇': { link: '/projects/trait/trait_hanyong' },
    '豪桀': { link: '/projects/trait/trait_haojie' },
    '号令': { link: '/projects/trait/trait_haoling' },
    '和衷': { link: '/projects/trait/trait_hezhong' },
    '后至': { link: '/projects/trait/trait_houzhi' },
    '虎侯': { link: '/projects/trait/trait_huhou' },
    '虎卫': { link: '/projects/trait/trait_huwei' },
    '桓武': { link: '/projects/trait/trait_huanwu' },
    '皇图': { link: '/projects/trait/trait_huangtu' },
    '回天': { link: '/projects/trait/trait_huitian' },
    '惑众': { link: '/projects/trait/trait_huozhong' },
    '机鉴': { link: '/projects/trait/trait_jijian' },
    '稽考': { link: '/projects/trait/trait_jikao' },
    '急行': { link: '/projects/trait/trait_jixing' },
    '掎角': { link: '/projects/trait/trait_jijiao' },
    '将才': { link: '/projects/trait/trait_jiangcai' },
    '矫然': { link: '/projects/trait/trait_jiaoran' },
    '精骑': { link: '/projects/trait/trait_jingqi' },
    '景从': { link: '/projects/trait/trait_jingcong' },
    '九变': { link: '/projects/trait/trait_jiubian' },
    '倨傲': { link: '/projects/trait/trait_juao' },
    '堪舆': { link: '/projects/trait/trait_kanyu' },
    '戾机': { link: '/projects/trait/trait_liji' },
    '裂缯': { link: '/projects/trait/trait_liezeng' },
    '凛然': { link: '/projects/trait/trait_linran' },
    '凌弱': { link: '/projects/trait/trait_lingruo' },
    '勠力': { link: '/projects/trait/trait_luli' },
    '率然': { link: '/projects/trait/trait_shuairan' },
    '庙算': { link: '/projects/trait/trait_miaosuan' },
    '名士': { link: '/projects/trait/trait_mingshi' },
    '明候': { link: '/projects/trait/trait_minghou' },
    '明悟': { link: '/projects/trait/trait_mingwu' },
    '鸣镝': { link: '/projects/trait/trait_mingdi' },
    '募兵': { link: '/projects/trait/trait_mobing' },
    '能吏': { link: '/projects/trait/trait_nengli' },
    '披靡': { link: '/projects/trait/trait_pimi' },
    '齐心': { link: '/projects/trait/trait_qixin' },
    '奇才': { link: '/projects/trait/trait_qicai' },
    '气焰': { link: '/projects/trait/trait_qiyan' },
    '羌战': { link: '/projects/trait/trait_qiangzhan' },
    '强运': { link: '/projects/trait/trait_qiangyun' },
    '巧匠': { link: '/projects/trait/trait_qiaojiang' },
    '侵攻': { link: '/projects/trait/trait_qinggong' },
    '穷经': { link: '/projects/trait/trait_qiongjing' },
    '饶用': { link: '/projects/trait/trait_raoyong' },
    '神工': { link: '/projects/trait/trait_shengong2' },
    '审慎': { link: '/projects/trait/trait_shenshen' },
    '绳准': { link: '/projects/trait/trait_shengzhun' },
    '识破': { link: '/projects/trait/trait_shipo' },
    '世家': { link: '/projects/trait/trait_shijia' },
    '示弱': { link: '/projects/trait/trait_shiruo' },
    '书蠹': { link: '/projects/trait/trait_shudu' },
    '纾难': { link: '/projects/trait/trait_shunan' },
    '输送': { link: '/projects/trait/trait_shusong' },
    '帅才': { link: '/projects/trait/trait_shuaicai' },
    '水鉴': { link: '/projects/trait/trait_shuijian' },
    '夙慧': { link: '/projects/trait/trait_suhui' },
    '素心': { link: '/projects/trait/trait_suxin' },
    '宿将': { link: '/projects/trait/trait_sujiang' },
    '天启': { link: '/projects/trait/trait_tianqi' },
    '天佑': { link: '/projects/trait/trait_tianyou' },
    '铁壁': { link: '/projects/trait/trait_tiebi' },
    '通鉴': { link: '/projects/trait/trait_tongjian' },
    '统筹': { link: '/projects/trait/trait_tongchou' },
    '武库': { link: '/projects/trait/trait_wuku' },
    '侠气': { link: '/projects/trait/trait_xiaqi' },
    '先登': { link: '/projects/trait/trait_xiandeng' },
    '先发': { link: '/projects/trait/trait_xianfa' },
    '先识': { link: '/projects/trait/trait_xianshi' },
    '骁勇': { link: '/projects/trait/trait_xiaoyong' },
    '心眼': { link: '/projects/trait/trait_xinyan' },
    '兴利': { link: '/projects/trait/trait_xingli' },
    '悬壶': { link: '/projects/trait/trait_xuanhu' },
    '雅量': { link: '/projects/trait/trait_yaliang' },
    '雅望': { link: '/projects/trait/trait_yawang' },
    '严毅': { link: '/projects/trait/trait_yanyi' },
    '一心': { link: '/projects/trait/trait_yixin' },
    '因势': { link: '/projects/trait/trait_yinshi' },
    '英杰': { link: '/projects/trait/trait_yingjie' },
    '玉壶': { link: '/projects/trait/trait_yuhu' },
    '御下': { link: '/projects/trait/trait_yuxia' },
    '章句': { link: '/projects/trait/trait_zhangju' },
    '长驱': { link: '/projects/trait/trait_changqu' },
    '针砭': { link: '/projects/trait/trait_zhenbian' },
    '镇心': { link: '/projects/trait/trait_zhenxin' },
    '跖道': { link: '/projects/trait/trait_zhidao' },
    '止水': { link: '/projects/trait/trait_zhishui' },
    '智迟': { link: '/projects/trait/trait_zhichi' },
    '中孚': { link: '/projects/trait/trait_zhongfu' },
    '忠志': { link: '/projects/trait/trait_zhongzhi' },
    '自若': { link: '/projects/trait/trait_ziruo' },
};

export default function FiveStringTable({ data }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [activeTrait, setActiveTrait] = useState(null);

    // 确保数据最多包含五个元素，并过滤掉空值
    const tableData = [...data]
        .filter(val => val !== undefined && val !== null && val !== '')
        .slice(0, 5);

    // 行标题（可自定义）
    const TableTitle = '特质';
    const rowTitles = ['地域', '个人', '个人', '个人', '个人'];

    // 添加地域特质的链接
    const regionTraitLink = '/projects/trait/trait_00_regional';

    // 获取特质颜色（如果存在）
    const getTraitColor = (trait) => {
        return TRAIT_MAP[trait]?.color || '#4a5568'; // 默认灰色
    };

    // 获取特质链接（如果存在）
    const getTraitLink = (trait) => {
        return TRAIT_MAP[trait]?.link || null;
    };

    // 处理特质点击事件
    const handleTraitClick = (trait, event) => {
        const link = getTraitLink(trait);
        if (link) {
            setActiveTrait(trait);
        }
    };

    return (
        <div className="mx-auto min-w-[280px] max-w-md overflow-hidden rounded-lg relative">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th colSpan="2" className="px-4 py-2 text-center bg-gray-100 font-semibold text-gray-800">
                            {TableTitle}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((value, index) => {
                        const hasLink = getTraitLink(value);
                        const traitColor = getTraitColor(value);
                        const traitInfo = TRAIT_MAP[value];

                        // 判断是否为 Ordinary 级别，决定是否添加发光效果
                        const isGlow = traitInfo?.color === TraitColor.Oridinary;
                        const glowStyle = isGlow
                            ? { textShadow: `0 0 8px ${traitColor}, 0 0 12px ${traitColor}` }
                            : {};

                        // 合并文字颜色与发光样式
                        const textStyle = { color: traitColor, ...glowStyle };

                        return (
                            <tr
                                key={index}
                                className={`transition-all duration-200 ${hoveredIndex === index
                                    ? 'bg-green-50 transform scale-[1.02]'
                                    : 'bg-white'
                                    }`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <td className="px-4 py-2 font-medium text-gray-700 border-b border-gray-200 w-1/3 text-center border-r">
                                    {/* 为第一行的标题添加链接 */}
                                    {index === 0 ? (
                                        <a href={regionTraitLink}>
                                            {rowTitles[index]}
                                        </a>
                                    ) : (
                                        rowTitles[index] || '特质'
                                    )}
                                </td>
                                <td className={`text-center px-4 py-2 border-b border-gray-200 font-medium ${hoveredIndex === index ? 'text-green-700' : ''
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        {hasLink ? (
                                            <a
                                                href={getTraitLink(value)}
                                                onClick={(e) => handleTraitClick(value, e)}
                                                className={`font-medium cursor-pointer hover:underline ${activeTrait === value ? 'ring-2 ring-offset-1 ring-blue-500 rounded' : ''}`}
                                                style={textStyle}
                                            >
                                                {value}
                                            </a>
                                        ) : (
                                            <span style={textStyle}>{value}</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* 无数据提示 */}
            {tableData.length === 0 && (
                <div className="px-4 py-6 text-center text-gray-500 italic">
                    暂无特质数据
                </div>
            )}
        </div>
    );
}