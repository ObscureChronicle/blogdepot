export type Image = {
    src: string;
    alt?: string;
    caption?: string;
};

export type Link = {
    text: string;
    href: string;
};

export type HeroSlide = {
    label: string;
    text: string;
    image: Image;
    steamAppId: number;
};

export type Hero = {
    title?: string;
    slides: HeroSlide[];
    actions?: Link[];
};

export type SiteConfig = {
    website: string;
    logo?: Image;
    title: string;
    subtitle?: string;
    description: string;
    image?: Image;
    headerNavLinks?: Link[];
    footerNavLinks?: Link[];
    socialLinks?: Link[];
    hero?: Hero;
    postsPerPage?: number;
    projectsPerPage?: number;
};

const siteConfig: SiteConfig = {
    website: 'https://ocod.netlify.app/',
    title: '后汉稽异录',
    subtitle: 'IsaacZhang',
    description: '《后汉稽异录》（日文名：後漢・三国物語，英文名：Obscure Chronicle of Dynasty）资料站，收录游戏人物、势力、装备等百科词条与创作记录。',
    image: {
        src: '/title.png',
        alt: '《后汉稽异录》标题图'
    },
    headerNavLinks: [
        {
            text: '主页',
            href: '/'
        },
        {
            text: '百科',
            href: '/tags/'
        },
        {
            text: '日志',
            href: '/blog/'
        }
    ],
    footerNavLinks: [
        // {
        //     text: '关于',
        //     href: '/about'
        // },
        {
            text: '联系作者',
            href: '/contact/'
        },
        {
            text: 'QQ群',
            href: 'https://qm.qq.com/q/VAy5a0wUEK'
        },
        {
            text: 'Steam',
            href: 'https://store.steampowered.com/app/2010900/_/'
        },
        {
            text: 'X/Twitter',
            href: 'https://x.com/IsaacXBZhang'
        },
        {
            text: 'RSS订阅',
            href: 'https://ocod.netlify.app/rss.xml'
        }
    ],
    hero: {
        slides: [
            {
                label: '后汉稽异录',
                text: '**《后汉稽异录》**（繁体字『後漢稽異錄』，英文名 *Obscure Chronicle of Dynasty*，日文名「後漢・三国物語」）是一款「虚构的，但也应当是合理的」剧情向战棋类游戏，又似可将它看作是一段异位面的三国历史。因而诸君或将发现，游戏前期的剧情尚可称作较为熟知的三国故事，但是剧情愈后，和本位面差别愈大。许多在正史上着墨甚少乃至寥寥数笔的人物，亦可能在这段迥异的时空中绽放出别样的光芒。',
                image: {
                    src: '/title.png',
                    alt: '后汉稽异录 Obscure Chronicle of Dynasty'
                },
                steamAppId: 2010900
            },
            {
                label: '星命诀',
                text: '单于羌渠为国人所杀后，南匈奴正经历着无尽的内乱；张举张纯已死，幽州局势在刘虞主持下渐归平安；反董联军的战火似乎虽未波及到北境，但黑山军对冀州仍虎视眈眈。而作为一名臣子，该如何处理同主君与同僚的关系？**《后汉稽异录外传：星命诀》**（繁体字『後漢稽異錄外傳•星命訣』，英文名 *Obscure Chronicle of Dynasty* Extra Storyline: *Astrology and Numerology*，日文名「後漢・三国物語外伝：星と命の詩」）将以另一视角展开《后汉稽异录》序章与第一章的故事。',
                image: {
                    src: '/title-dlc.png',
                    alt: '后汉稽异录外传：星命诀'
                },
                steamAppId: 2694320
            }
        ]
    },
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;

/**
 * 第三方服务的客户端配置。这些值本来就会出现在浏览器里（Algolia 的是只读搜索 key），不是密钥。
 * 单独具名导出：客户端 <script> 只导入它，打包时不会把整个 siteConfig 带进浏览器 JS。
 */
export const thirdParty = {
    ga4MeasurementId: 'G-YFXCM8DEXJ',
    algolia: {
        appId: 'RNM6XVD15M',
        apiKey: 'fd8d188ac6fec286491d26f8c4493442',
        siteId: '72fc77ee-5596-45f9-95f3-7ceb21f85fdc',
        branch: 'main',
        scriptUrl: 'https://cdn.jsdelivr.net/npm/@algolia/algoliasearch-netlify-frontend@1/dist/algoliasearchNetlify.js',
        styleUrl: 'https://cdn.jsdelivr.net/npm/@algolia/algoliasearch-netlify-frontend@1/dist/algoliasearchNetlify.css'
    },
    waline: {
        serverURL: 'https://ocod-commemts.netlify.app/.netlify/functions/comment'
    }
} as const;
