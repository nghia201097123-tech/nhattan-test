export interface TreeNode {
  id: string;
  parentId: string | null;
  children?: TreeNode[];
  [key: string]: any;
}

export function buildTree<T extends TreeNode>(
  items: T[],
  parentId: string | null = null,
): T[] {
  const tree: T[] = [];

  for (const item of items) {
    if (item.parentId === parentId) {
      const children = buildTree(items, item.id);
      if (children.length > 0) {
        item.children = children;
      }
      tree.push(item);
    }
  }

  return tree;
}

export function flattenTree<T extends TreeNode>(tree: T[]): T[] {
  const result: T[] = [];

  for (const node of tree) {
    const { children, ...rest } = node;
    result.push(rest as T);
    if (children && children.length > 0) {
      result.push(...flattenTree(children as T[]));
    }
  }

  return result;
}

export function generatePath(parentPath: string | null, id: string): string {
  if (!parentPath) {
    return `/${id}/`;
  }
  return `${parentPath}${id}/`;
}

export function getLevel(path: string): number {
  if (!path) return 0;
  return path.split('/').filter(Boolean).length - 1;
}
