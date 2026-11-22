/**
 * 配饰附诗的本地化数据入口。
 *
 * 覆盖 src/content/projects/treasure 下全部 142 个 MDX 页面（139 个物品页 + 3 个类型页），
 * 与目录文件一一对应。键为词条 slug，hant / ja / en 暂为空占位，日后逐条填写；
 * 缺省或空字符串时表格显示「—」。
 *
 * 类型页（00_item-type / 00_military-book / 00_treasure-type）没有附诗，
 * 表格只渲染有原文的词条，这 3 条仅作为占位数据保留。
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
    { slug: '00_item-type', hant: '', ja: '', en: '' }, // 类型页：宝物
    { slug: '00_military-book', hant: '', ja: '', en: '' }, // 类型页：兵法书
    { slug: '00_treasure-type', hant: '', ja: '', en: '' }, // 类型页：配饰
    { slug: 'anlegongyin', hant: '', ja: '', en: '' }, // 安乐公印
    { slug: 'baihong', hant: '', ja: '', en: '' }, // 白虹
    { slug: 'baili', hant: '', ja: '', en: '' }, // 百里
    { slug: 'baiyushan', hant: '', ja: '', en: '' }, // 白羽扇
    { slug: 'beilin', hant: '', ja: '', en: '' }, // 北林
    { slug: 'biluo', hant: '', ja: '', en: '' }, // 碧落
    { slug: 'biluo-duan', hant: '', ja: '', en: '' }, // 碧落·断
    { slug: 'bingshuershisipian', hant: '', ja: '', en: '' }, // 兵书二十四篇
    { slug: 'bixie', hant: '', ja: '', en: '' }, // 辟邪
    { slug: 'changminglv', hant: '', ja: '', en: '' }, // 长命缕
    { slug: 'changminglv-duan', hant: '', ja: '', en: '' }, // 长命缕·断
    { slug: 'chendao', hant: '', ja: '', en: '' }, // 陈到
    { slug: 'chuanguoyuxi', hant: '', ja: '', en: '' }, // 传国玉玺
    { slug: 'chunqiuzuoshichuan', hant: '', ja: '', en: '' }, // 春秋左氏传
    { slug: 'chunqiuzuoshijingzhuanjijie', hant: '', ja: '', en: '' }, // 春秋左氏经传集解
    { slug: 'dahuang', hant: '', ja: '', en: '' }, // 大黄
    { slug: 'dajiangjunyin', hant: '', ja: '', en: '' }, // 大将军印
    { slug: 'daliang', hant: '', ja: '', en: '' }, // 大梁
    { slug: 'danxin', hant: '', ja: '', en: '' }, // 丹心
    { slug: 'danxin-gai', hant: '', ja: '', en: '' }, // 丹心·改
    { slug: 'daxialongque', hant: '', ja: '', en: '' }, // 大夏龙雀
    { slug: 'daxialongque-gai', hant: '', ja: '', en: '' }, // 大夏龙雀·改
    { slug: 'dianwei', hant: '', ja: '', en: '' }, // 典韦
    { slug: 'duogongchuangnutuzhi', hant: '', ja: '', en: '' }, // 多弓床弩图纸
    { slug: 'fangtian', hant: '', ja: '', en: '' }, // 方天
    { slug: 'feiming', hant: '', ja: '', en: '' }, // 朏明
    { slug: 'feishichetuzhi', hant: '', ja: '', en: '' }, // 飞石车图纸
    { slug: 'fenghoubazhentu', hant: '', ja: '', en: '' }, // 风后八阵图
    { slug: 'fengyi', hant: '', ja: '', en: '' }, // 凤仪
    { slug: 'guanjin', hant: '', ja: '', en: '' }, // 纶巾
    { slug: 'guiguzi', hant: '', ja: '', en: '' }, // 鬼谷子
    { slug: 'hechang', hant: '', ja: '', en: '' }, // 鹤氅
    { slug: 'houhanjiyilu', hant: '', ja: '', en: '' }, // 后汉稽异录
    { slug: 'houhu', hant: '', ja: '', en: '' }, // 后扈
    { slug: 'hundun', hant: '', ja: '', en: '' }, // 浑沌
    { slug: 'jiangtian', hant: '', ja: '', en: '' }, // 绛天
    { slug: 'jihelun', hant: '', ja: '', en: '' }, // 济河论
    { slug: 'jindingchegai', hant: '', ja: '', en: '' }, // 金顶车盖
    { slug: 'jingxing', hant: '', ja: '', en: '' }, // 景星
    { slug: 'jiujieliangshizhang', hant: '', ja: '', en: '' }, // 九节良师杖
    { slug: 'jiyilucanjuan-bazhe', hant: '', ja: '', en: '' }, // 稽异录残卷·霸者篇
    { slug: 'jiyilucanjuan-jianjun', hant: '', ja: '', en: '' }, // 稽异录残卷·监军篇
    { slug: 'jiyilucanjuan-sujiang', hant: '', ja: '', en: '' }, // 稽异录残卷·宿将篇
    { slug: 'jiyilucanjuan-wangzuo', hant: '', ja: '', en: '' }, // 稽异录残卷·王佐篇
    { slug: 'jizhoumuyin', hant: '', ja: '', en: '' }, // 冀州牧印
    { slug: 'jushu', hant: '', ja: '', en: '' }, // 距黍
    { slug: 'kaishan', hant: '', ja: '', en: '' }, // 开山
    { slug: 'kongzijiayu', hant: '', ja: '', en: '' }, // 孔子家语
    { slug: 'laozixiangerzhu', hant: '', ja: '', en: '' }, // 老子想尔注
    { slug: 'li', hant: '', ja: '', en: '' }, // 离
    { slug: 'liannutuzhi', hant: '', ja: '', en: '' }, // 连弩图纸
    { slug: 'liucai', hant: '', ja: '', en: '' }, // 流采
    { slug: 'liuguang', hant: '', ja: '', en: '' }, // 流光
    { slug: 'liutao', hant: '', ja: '', en: '' }, // 六韬
    { slug: 'liuxing', hant: '', ja: '', en: '' }, // 流星
    { slug: 'lizhuan', hant: '', ja: '', en: '' }, // 礼传
    { slug: 'longdan', hant: '', ja: '', en: '' }, // 龙胆
    { slug: 'lunyujijie', hant: '', ja: '', en: '' }, // 论语集解
    { slug: 'luochuanxue', hant: '', ja: '', en: '' }, // 洛川雪
    { slug: 'lvchen', hant: '', ja: '', en: '' }, // 绿沉
    { slug: 'lvshuang', hant: '', ja: '', en: '' }, // 履霜
    { slug: 'lvshuang-gai', hant: '', ja: '', en: '' }, // 履霜·改
    { slug: 'maoshijian', hant: '', ja: '', en: '' }, // 毛诗笺
    { slug: 'mengdexinshu', hant: '', ja: '', en: '' }, // 孟德新书
    { slug: 'mingyi', hant: '', ja: '', en: '' }, // 明夷
    { slug: 'mozi', hant: '', ja: '', en: '' }, // 墨子
    { slug: 'mozigu', hant: '', ja: '', en: '' }, // 墨子诂
    { slug: 'pingqiangzhigui', hant: '', ja: '', en: '' }, // 平羌指归
    { slug: 'pojun', hant: '', ja: '', en: '' }, // 破军
    { slug: 'qinggang', hant: '', ja: '', en: '' }, // 青釭
    { slug: 'qingming', hant: '', ja: '', en: '' }, // 青冥
    { slug: 'qingshang', hant: '', ja: '', en: '' }, // 清商
    { slug: 'qiongqi', hant: '', ja: '', en: '' }, // 穷奇
    { slug: 'qiran', hant: '', ja: '', en: '' }, // 凄然
    { slug: 'qixing', hant: '', ja: '', en: '' }, // 七星
    { slug: 'sanlve', hant: '', ja: '', en: '' }, // 三略
    { slug: 'shanghanzabinglun', hant: '', ja: '', en: '' }, // 伤寒杂病论
    { slug: 'shangshuzhangju', hant: '', ja: '', en: '' }, // 尚书章句
    { slug: 'shemao', hant: '', ja: '', en: '' }, // 蛇矛（丈八蛇矛）
    { slug: 'shierqice', hant: '', ja: '', en: '' }, // 十二奇策
    { slug: 'shuanggu', hant: '', ja: '', en: '' }, // 双股
    { slug: 'shuangyue', hant: '', ja: '', en: '' }, // 霜月
    { slug: 'shuiyue', hant: '', ja: '', en: '' }, // 水月
    { slug: 'sibenlun', hant: '', ja: '', en: '' }, // 四本论
    { slug: 'siming', hant: '', ja: '', en: '' }, // 司命
    { slug: 'sizhao', hant: '', ja: '', en: '' }, // 思召
    { slug: 'sunbinbingfa', hant: '', ja: '', en: '' }, // 孙膑兵法
    { slug: 'sunzibingfa', hant: '', ja: '', en: '' }, // 孙子兵法
    { slug: 'sunzijijie', hant: '', ja: '', en: '' }, // 孙子集解
    { slug: 'sunzilvejie', hant: '', ja: '', en: '' }, // 孙子略解
    { slug: 'suxian', hant: '', ja: '', en: '' }, // 素弦
    { slug: 'taipingqinglingshu', hant: '', ja: '', en: '' }, // 太平清领书
    { slug: 'tanlang', hant: '', ja: '', en: '' }, // 贪狼
    { slug: 'taotie', hant: '', ja: '', en: '' }, // 饕餮
    { slug: 'taowu', hant: '', ja: '', en: '' }, // 梼杌
    { slug: 'taoyao', hant: '', ja: '', en: '' }, // 桃夭
    { slug: 'tianshidaopao', hant: '', ja: '', en: '' }, // 天师道袍
    { slug: 'tianyi', hant: '', ja: '', en: '' }, // 天义
    { slug: 'tuntianyaolue', hant: '', ja: '', en: '' }, // 屯田要略
    { slug: 'weigongzibingfa', hant: '', ja: '', en: '' }, // 魏公子兵法
    { slug: 'wugou', hant: '', ja: '', en: '' }, // 吴钩
    { slug: 'wuhuoshenyanshan', hant: '', ja: '', en: '' }, // 五火神焰扇
    { slug: 'wuzibingfa', hant: '', ja: '', en: '' }, // 吴子兵法
    { slug: 'xiahong', hant: '', ja: '', en: '' }, // 赮虹
    { slug: 'xiahong-gai', hant: '', ja: '', en: '' }, // 赮虹·改
    { slug: 'xiahong-ji', hant: '', ja: '', en: '' }, // 赮虹·极
    { slug: 'xiahouhe', hant: '', ja: '', en: '' }, // 夏侯和
    { slug: 'xilu', hant: '', ja: '', en: '' }, // 西陆
    { slug: 'xinyue', hant: '', ja: '', en: '' }, // 心月
    { slug: 'xinyue-gai', hant: '', ja: '', en: '' }, // 心月·改
    { slug: 'xuanxiao', hant: '', ja: '', en: '' }, // 玄枵
    { slug: 'yajiao', hant: '', ja: '', en: '' }, // 涯角
    { slug: 'yanyue', hant: '', ja: '', en: '' }, // 偃月
    { slug: 'yanyue-gai', hant: '', ja: '', en: '' }, // 偃月·改
    { slug: 'yanyun', hant: '', ja: '', en: '' }, // 燕云
    { slug: 'yihua', hant: '', ja: '', en: '' }, // 燚华
    { slug: 'yinanji', hant: '', ja: '', en: '' }, // 易难记
    { slug: 'yinhan', hant: '', ja: '', en: '' }, // 银汉
    { slug: 'yinqiu', hant: '', ja: '', en: '' }, // 引秋
    { slug: 'yitian', hant: '', ja: '', en: '' }, // 倚天
    { slug: 'yitian-gai', hant: '', ja: '', en: '' }, // 倚天·改
    { slug: 'yitian-ji', hant: '', ja: '', en: '' }, // 倚天·极
    { slug: 'youhuai', hant: '', ja: '', en: '' }, // 有怀
    { slug: 'yuheng', hant: '', ja: '', en: '' }, // 玉衡
    { slug: 'yuliaozi', hant: '', ja: '', en: '' }, // 尉缭子
    { slug: 'yuru', hant: '', ja: '', en: '' }, // 玉汝
    { slug: 'yuxunyushu', hant: '', ja: '', en: '' }, // 与荀彧书
    { slug: 'zhengshisuyuanji', hant: '', ja: '', en: '' }, // 正始溯源记
    { slug: 'zhilun', hant: '', ja: '', en: '' }, // 治论
    { slug: 'zhouyijijie', hant: '', ja: '', en: '' }, // 周易集解
    { slug: 'zhouyizhangju', hant: '', ja: '', en: '' }, // 周易章句
    { slug: 'zhouyizhu-wangbi', hant: '', ja: '', en: '' }, // 周易注〔王弼〕
    { slug: 'zhouyizhu-yufan', hant: '', ja: '', en: '' }, // 周易注〔虞翻〕
    { slug: 'zhuifengche', hant: '', ja: '', en: '' }, // 追锋车
    { slug: 'zhulong', hant: '', ja: '', en: '' }, // 逐龙
    { slug: 'zhulongpu', hant: '', ja: '', en: '' }, // 逐龙谱
    { slug: 'zhushujinian', hant: '', ja: '', en: '' }, // 竹书纪年
    { slug: 'zidian', hant: '', ja: '', en: '' }, // 紫电
    { slug: 'zijin', hant: '', ja: '', en: '' } // 子衿
];
