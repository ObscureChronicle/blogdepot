export type PaginationItem = number | 'ellipsis';

function range(start: number, end: number): number[] {
    if (start > end) return [];
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Builds the list of page numbers / ellipsis markers to render.
 * Always shows the first/last `boundaryCount` pages and `siblingCount`
 * pages around the current page; a single hidden page is shown directly
 * instead of an ellipsis (e.g. "1 2 3 4 5 … 8" rather than "1 … 3 4 5 … 8").
 */
export function getPaginationRange(currentPage: number, lastPage: number, siblingCount = 1, boundaryCount = 1): PaginationItem[] {
    const totalNumbers = boundaryCount * 2 + siblingCount * 2 + 3;

    if (lastPage <= totalNumbers) {
        return range(1, lastPage);
    }

    const startPages = range(1, boundaryCount);
    const endPages = range(lastPage - boundaryCount + 1, lastPage);

    const middleStart = Math.max(currentPage - siblingCount, boundaryCount + 1);
    const middleEnd = Math.min(currentPage + siblingCount, lastPage - boundaryCount);

    const items: PaginationItem[] = [...startPages];

    const leftGap = middleStart - boundaryCount - 1;
    if (leftGap === 1) {
        items.push(boundaryCount + 1);
    } else if (leftGap > 1) {
        items.push('ellipsis');
    }

    items.push(...range(middleStart, middleEnd));

    const rightGap = lastPage - boundaryCount - middleEnd;
    if (rightGap === 1) {
        items.push(lastPage - boundaryCount);
    } else if (rightGap > 1) {
        items.push('ellipsis');
    }

    items.push(...endPages);

    return items;
}

/** Astro `paginate()` convention: page 1 has no numeric suffix, page N (>1) is `${basePath}/${N}`. */
export function buildPageUrl(basePath: string, pageNumber: number): string {
    const normalizedBase = basePath.replace(/\/+$/, '') || '/';
    return pageNumber <= 1 ? normalizedBase : `${normalizedBase}/${pageNumber}`;
}

export function clampPage(value: number, lastPage: number): number {
    return Math.min(Math.max(value, 1), lastPage);
}
