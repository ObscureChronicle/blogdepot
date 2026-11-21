/**
 * 配饰附诗总览的数据入口。
 *
 * 收录范围：《后汉稽异录外传：星命诀》源数据 item.txt 中「分类=配饰」且站内有词条的条目。
 * 源数据里「穷奇」出现两行，站内只有一个词条，这里按词条去重，共 50 条。
 *
 * 原文（baseDescription / dlcDescription / baseVariants / dlcVariants）在构建时直接从
 * src/content/projects/treasure/<slug>.mdx 读取，这里只登记 slug 与本地化文本。
 * 本地化文本暂为空占位，日后补入；缺省或空字符串时表格显示「—」。
 */

export type TreasurePoemLocalization = {
    /** 繁體字 */
    hant?: string;
    /** 日本語 */
    ja?: string;
    /** English */
    en?: string;
};

export type TreasurePoemEntry = TreasurePoemLocalization & {
    /** src/content/projects/treasure/<slug>.mdx */
    slug: string;
};

export const TREASURE_POEMS: TreasurePoemEntry[] = [
    { slug: 'dianwei', hant: '', ja: '', en: '' }, // 典韦
    { slug: 'yitian', hant: '', ja: '', en: '' }, // 倚天
    { slug: 'shuanggu', hant: '', ja: '', en: '' }, // 双股
    { slug: 'sizhao', hant: '', ja: '', en: '' }, // 思召
    { slug: 'qinggang', hant: '', ja: '', en: '' }, // 青釭
    { slug: 'xilu', hant: '', ja: '', en: '' }, // 西陆
    { slug: 'xinyue', hant: '', ja: '', en: '' }, // 心月
    { slug: 'qixing', hant: '', ja: '', en: '' }, // 七星
    { slug: 'wugou', hant: '', ja: '', en: '' }, // 吴钩
    { slug: 'daxialongque', hant: '', ja: '', en: '' }, // 大夏龙雀
    { slug: 'siming', hant: '', ja: '', en: '' }, // 司命
    { slug: 'li', hant: '', ja: '', en: '' }, // 离
    { slug: 'mingyi', hant: '', ja: '', en: '' }, // 明夷
    { slug: 'fangtian', hant: '', ja: '', en: '' }, // 方天
    { slug: 'xiahong', hant: '', ja: '', en: '' }, // 赮虹
    { slug: 'yanyue', hant: '', ja: '', en: '' }, // 偃月
    { slug: 'shemao', hant: '', ja: '', en: '' }, // 蛇矛（丈八蛇矛）
    { slug: 'kaishan', hant: '', ja: '', en: '' }, // 开山
    { slug: 'daliang', hant: '', ja: '', en: '' }, // 大梁
    { slug: 'zhulong', hant: '', ja: '', en: '' }, // 逐龙
    { slug: 'pojun', hant: '', ja: '', en: '' }, // 破军
    { slug: 'taowu', hant: '', ja: '', en: '' }, // 梼杌
    { slug: 'lvshuang', hant: '', ja: '', en: '' }, // 履霜
    { slug: 'tianyi', hant: '', ja: '', en: '' }, // 天义
    { slug: 'xuanxiao', hant: '', ja: '', en: '' }, // 玄枵
    { slug: 'biluo', hant: '', ja: '', en: '' }, // 碧落
    { slug: 'dahuang', hant: '', ja: '', en: '' }, // 大黄
    { slug: 'shuiyue', hant: '', ja: '', en: '' }, // 水月
    { slug: 'yuheng', hant: '', ja: '', en: '' }, // 玉衡
    { slug: 'liuguang', hant: '', ja: '', en: '' }, // 流光
    { slug: 'qingshang', hant: '', ja: '', en: '' }, // 清商
    { slug: 'yinhan', hant: '', ja: '', en: '' }, // 银汉
    { slug: 'qiongqi', hant: '', ja: '', en: '' }, // 穷奇
    { slug: 'tanlang', hant: '', ja: '', en: '' }, // 贪狼
    { slug: 'wuhuoshenyanshan', hant: '', ja: '', en: '' }, // 五火神焰扇
    { slug: 'jiujieliangshizhang', hant: '', ja: '', en: '' }, // 九节良师杖
    { slug: 'yinanji', hant: '', ja: '', en: '' }, // 易难记
    { slug: 'shangshuzhangju', hant: '', ja: '', en: '' }, // 尚书章句
    { slug: 'maoshijian', hant: '', ja: '', en: '' }, // 毛诗笺
    { slug: 'lizhuan', hant: '', ja: '', en: '' }, // 礼传
    { slug: 'chunqiuzuoshichuan', hant: '', ja: '', en: '' }, // 春秋左氏传
    { slug: 'houhanjiyilu', hant: '', ja: '', en: '' }, // 后汉稽异录
    { slug: 'tuntianyaolue', hant: '', ja: '', en: '' }, // 屯田要略
    { slug: 'pingqiangzhigui', hant: '', ja: '', en: '' }, // 平羌指归
    { slug: 'shanghanzabinglun', hant: '', ja: '', en: '' }, // 伤寒杂病论
    { slug: 'laozixiangerzhu', hant: '', ja: '', en: '' }, // 老子想尔注
    { slug: 'taipingqinglingshu', hant: '', ja: '', en: '' }, // 太平清领书
    { slug: 'jizhoumuyin', hant: '', ja: '', en: '' }, // 冀州牧印
    { slug: 'dajiangjunyin', hant: '', ja: '', en: '' }, // 大将军印
    { slug: 'chuanguoyuxi', hant: '', ja: '', en: '' } // 传国玉玺
];
