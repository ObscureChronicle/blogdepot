export type Image = {
    src: string;
    alt?: string;
    caption?: string;
};

export type Link = {
    text: string;
    href: string;
};

export type Hero = {
    title?: string;
    text?: string;
    image?: Image;
    actions?: Link[];
};

export type Subscribe = {
    title?: string;
    text?: string;
    formUrl: string;
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
    subscribe?: Subscribe;
    postsPerPage?: number;
    projectsPerPage?: number;
};

const siteConfig: SiteConfig = {
    website: 'https://ocod.netlify.app/',
    title: '后汉稽异录',
    subtitle: 'IsaacZhang',
    description: '后汉稽异录的资料站。',
    image: {
        src: '/title.png',
        alt: 'Dante - Astro.js and Tailwind CSS theme'
    },
    headerNavLinks: [
        {
            text: '主页',
            href: '/'
        },
        {
            text: 'Wiki',
            href: '/projects'
        },
        {
            text: '日志',
            href: '/blog'
        },
        {
            text: '索引',
            href: '/tags'
        }
    ],
    footerNavLinks: [
        // {
        //     text: '关于',
        //     href: '/about'
        // },
        {
            text: '联系作者',
            href: '/contact'
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
    // socialLinks: [
    //     {
    //         text: 'Steam',
    //         href: 'https://store.steampowered.com/app/2010900/_/'
    //     },
    //     {
    //         text: 'Instagram',
    //         href: 'https://instagram.com/'
    //     },
    //     {
    //         text: 'X/Twitter',
    //         href: 'https://twitter.com/'
    //     }
    // ],
    hero: {
        // title: 'Hi There & Welcome to My Corner of the Web!',
        text: '这是一款「虚构的，但也应当是合理的」剧情向战棋类游戏，又似可将它看作是一段异位面的三国历史。因而诸君或将发现，游戏前期的剧情尚可称作较为熟知的三国故事，但是剧情愈后，和本位面差别愈大。许多在正史上着墨甚少乃至寥寥数笔的人物，亦可能在这段迥异的时空中绽放出别样的光芒。',
        image: {
            src: '/title.png',
            alt: '后汉稽异录 Obscure Chronicle of Dynasty'
        },
        actions: [
            {
                text: '前往Steam游戏商店页面',
                href: 'https://store.steampowered.com/app/2010900/_/'
            }
        ]
    },
    // subscribe: {
    //     title: 'Subscribe to Dante Newsletter',
    //     text: 'One update per week. All the latest posts directly in your inbox.',
    //     formUrl: '#'
    // },
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;
