// Algolia（Netlify 插件版）前端库的加载与初始化，只在浏览器里使用。
// 百科首页的搜索框（AlgoliaSearch.astro）和顶栏搜索按钮（NavSearch.astro）共用。
import { thirdParty } from '../data/site-config';

type AlgoliaNetlifyOptions = {
    appId: string;
    apiKey: string;
    siteId: string;
    branch: string;
    selector: string;
    placeholder?: string;
    /** true：始终用全屏的「独立面板」模式；不传时按库默认，窄屏才用 */
    detached?: boolean;
};

declare global {
    interface Window {
        algoliasearchNetlify?: (options: AlgoliaNetlifyOptions) => void;
    }
}

const PLACEHOLDER = '搜索词条…';

// 库脚本和样式整个会话只加载一次；ClientRouter 换页后直接复用
let loading: Promise<void> | undefined;

export function loadAlgolia(): Promise<void> {
    loading ??= new Promise((resolve, reject) => {
        if (!document.querySelector(`link[href="${thirdParty.algolia.styleUrl}"]`)) {
            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.href = thirdParty.algolia.styleUrl;
            document.head.append(style);
        }
        const script = document.createElement('script');
        script.src = thirdParty.algolia.scriptUrl;
        script.onload = () => resolve();
        script.onerror = () => {
            loading = undefined;
            reject(new Error('Algolia script not loaded.'));
        };
        document.head.append(script);
    });
    return loading;
}

/** 在 el（须带 id）里渲染搜索框；同一个元素只初始化一次 */
export async function mountAlgolia(el: HTMLElement, options: { detached?: boolean } = {}): Promise<boolean> {
    if (el.dataset.initialized) return true;
    el.dataset.initialized = 'true';
    try {
        await loadAlgolia();
    } catch (error) {
        delete el.dataset.initialized;
        console.error(error);
        return false;
    }
    const { appId, apiKey, siteId, branch } = thirdParty.algolia;
    window.algoliasearchNetlify?.({ appId, apiKey, siteId, branch, selector: `#${el.id}`, placeholder: PLACEHOLDER, ...options });
    return true;
}
