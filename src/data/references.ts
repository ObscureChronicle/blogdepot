/**
 * 参考文献词条（/projects/wiki/reference/）的书目数据，由 Layout_Reference.astro 渲染。
 * 书名不带书名号，渲染时再加。
 */

/** 原典书架的分组，数组顺序即书架从上到下的顺序 */
export const CLASSIC_GROUPS = ['正史', '编年', '别史杂史', '地理政书', '类书', '补表目录总集', '小说'] as const;

export type ClassicGroup = (typeof CLASSIC_GROUPS)[number];

export interface ClassicBook {
    title: string;
    group: ClassicGroup;
}

export interface Work {
    author: string;
    title: string;
}

/** 原典：组内顺序即书架上从左到右的顺序 */
export const classics: ClassicBook[] = [
    { title: '三国志', group: '正史' },
    { title: '三国志补注', group: '正史' },
    { title: '三国志集解', group: '正史' },
    { title: '后汉书', group: '正史' },
    { title: '后汉书集解', group: '正史' },
    { title: '宋书', group: '正史' },
    { title: '晋书', group: '正史' },
    { title: '后汉纪', group: '编年' },
    { title: '资治通鉴', group: '编年' },
    { title: '资治通鉴考异', group: '编年' },
    { title: '东观汉记', group: '别史杂史' },
    { title: '英雄记', group: '别史杂史' },
    { title: '华阳国志', group: '别史杂史' },
    { title: '水经注', group: '地理政书' },
    { title: '通典', group: '地理政书' },
    { title: '通志', group: '地理政书' },
    { title: '太平御览', group: '类书' },
    { title: '册府元龟', group: '类书' },
    { title: '后汉书三国志补表三十种', group: '补表目录总集' },
    { title: '后汉艺文志', group: '补表目录总集' },
    { title: '全上古三代秦汉三国六朝文', group: '补表目录总集' },
    { title: '世说新语', group: '小说' },
    { title: '三国志平话', group: '小说' },
    { title: '三国志通俗演义', group: '小说' }
];

/** 著述：按作者拼音排列（沿用原词条的顺序） */
export const works: Work[] = [
    { author: '安作璋', title: '秦汉官制史稿' },
    { author: '巴菲尔德', title: '危险的边疆：游牧帝国与中国' },
    { author: '卜正民 等', title: '哈佛中国史' },
    { author: '常建华 等', title: '中国宗族通史' },
    { author: '陈华昌', title: '曹操与道教及其游仙诗研究' },
    { author: '陈侃理 等', title: '重写秦汉史：出土文献的视野' },
    { author: '陈苏镇', title: '〈春秋〉与汉道：两汉政治与政治文化研究' },
    { author: '陈苏镇', title: '两汉魏晋南北朝史探幽' },
    { author: '陈序经', title: '匈奴帝国史' },
    { author: '程元敏', title: '汉经学史' },
    { author: '川胜义雄', title: '魏晋南北朝' },
    { author: '戴燕', title: '〈三国志〉讲义' },
    { author: '狄宇宙', title: '古代中国与其强邻' },
    { author: '东晋次', title: '东汉时代的政治与社会' },
    { author: '方诗铭', title: '三国人物散论' },
    { author: '费正清 等', title: '剑桥中国史' },
    { author: '冯渝杰', title: '神器有命：汉帝国的神圣性格及其崩解' },
    { author: '冈崎文夫', title: '魏晋南北朝通史' },
    { author: '龚剑', title: '中国刀剑史' },
    { author: '宫崎市定', title: '九品官人法研究：科举前史' },
    { author: '顾颉刚', title: '古史辨' },
    { author: '顾颉刚', title: '秦汉的方士与儒生' },
    { author: '何兹全', title: '三国史' },
    { author: '胡宝国', title: '汉唐间史学的发展' },
    { author: '胡鸿', title: '能夏则大与渐慕华风' },
    { author: '姜生', title: '曹操与原始道教' },
    { author: '金文京', title: '三国志的世界' },
    { author: '劳榦', title: '魏晋南北朝简史' },
    { author: '梁满仓', title: '三国史新论' },
    { author: '柳春新', title: '汉末晋初之际政治研究' },
    { author: '刘蓉', title: '汉魏名士研究' },
    { author: '刘旭', title: '中国古代兵器图册' },
    { author: '刘永华', title: '中国古代军戎服饰' },
    { author: '罗琨', title: '中国军事通史' },
    { author: '吕思勉', title: '三国史话' },
    { author: '吕思勉', title: '三国史话之余' },
    { author: '马伯乐', title: '马伯乐道教学术论著' },
    { author: '马长寿', title: '氐与羌' },
    { author: '孟彦弘', title: '出土文献与汉唐典制研究' },
    { author: '牟发松 等', title: '汉唐历史变迁视野下的社会与国家关系' },
    { author: '仇鹿鸣', title: '魏晋之际的政治权力与家族网络' },
    { author: '曲柄睿', title: '忽如远行客：秦汉的游士与游侠' },
    { author: '曲柄睿', title: '整齐世传：前四史人物列传编纂研究' },
    { author: '饶宗颐', title: '老子想尔注校证' },
    { author: '孙闻博', title: '秦汉军制演变史稿' },
    { author: '汤用彤', title: '魏晋玄学论稿' },
    { author: '唐长儒', title: '魏晋南北朝隋唐史讲义' },
    { author: '唐长儒', title: '魏晋南北朝史论丛' },
    { author: '陶贤都', title: '魏晋南北朝霸府与霸府政治研究' },
    { author: '田丰', title: '「孝宣情结」与东汉政治' },
    { author: '田晓菲', title: '赤壁之戟：建安与三国' },
    { author: '田余庆', title: '秦汉魏晋史探微' },
    { author: '田昭林', title: '中国战争史' },
    { author: '万绳楠', title: '陈寅恪魏晋南北朝史讲演录' },
    { author: '王仲荦', title: '魏晋南北朝史' },
    { author: '王明珂', title: '华夏边缘' },
    { author: '王明珂', title: '羌在汉藏之间' },
    { author: '王永平', title: '汉晋间社会阶层升降与历史变迁' },
    { author: '王永平', title: '孙吴政治与文化史论' },
    { author: '王兆春', title: '中国军事科技通史' },
    { author: '王子今', title: '秦汉史' },
    { author: '魏安', title: '三国演义版本考' },
    { author: '卫广来', title: '汉魏晋皇权嬗代' },
    { author: '吴金华', title: '三国志校诂' },
    { author: '夏含夷', title: '王弼的黄老政治思想' },
    { author: '邢义田', title: '天下一家：皇帝、官僚与社会' },
    { author: '徐培根 等', title: '中国历代战争史' },
    { author: '许倬云', title: '求古编' },
    { author: '阎步克', title: '品位与职位：秦汉魏晋南北朝官阶制度研究' },
    { author: '阎步克', title: '中国古代官阶制度引论' },
    { author: '杨泓', title: '中国古兵器论丛' },
    { author: '杨联陞', title: '东汉的豪族' },
    { author: '杨权', title: '新五德理论与两汉政治：尧后火德说考论' },
    { author: '余英时', title: '汉代贸易与扩张' },
    { author: '余英时', title: '士与中国文化' },
    { author: '张磊夫', title: '国之枭雄：曹操传' },
    { author: '张向荣', title: '三国前夜：士大夫政治与东汉皇权的崩解' },
    { author: '张旭华', title: '九品中正制研究' },
    { author: '周纬', title: '中国兵器史稿' },
    { author: '周一良', title: '魏晋南北朝史论' },
    { author: '朱子彦', title: '汉魏禅代与三国政治' },
    { author: '邹永杰 等', title: '国家与社会视角下的秦汉乡里秩序' }
];
