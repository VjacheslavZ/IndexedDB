import * as React from 'react';
import { FileNode } from '.';

export const useStableCallback = <T extends (...args: any[]) => any>(
  fn: T | undefined,
  fallback: T
) => {
  const ref = React.useRef(fn ?? fallback);
  React.useEffect(() => {
    ref.current = fn ?? fallback;
  }, [fn, fallback]);
  return React.useCallback((...args: Parameters<T>) => {
    return ref.current(...args);
  }, []);
};

export const mapTree = (
  nodes: FileNode[],
  mapper: (n: FileNode) => FileNode
): FileNode[] => {
  return nodes.map(n => {
    const next = n.children
      ? { ...n, children: mapTree(n.children, mapper) }
      : n;
    return mapper(next);
  });
};

export const filterTreeByIds = (
  nodes: FileNode[],
  ids: Set<string>
): { next: FileNode[]; deleted: FileNode[] } => {
  const deleted: FileNode[] = [];
  function recurse(list: FileNode[]): FileNode[] {
    const out: FileNode[] = [];
    for (const n of list) {
      if (ids.has(n.id)) {
        deleted.push(n);
        continue;
      }
      if (n.type === 'folder' && n.children) {
        const child = recurse(n.children);
        out.push({ ...n, children: child });
      } else {
        out.push(n);
      }
    }
    return out;
  }
  return { next: recurse(nodes), deleted };
};

export const renameInTree = (
  nodes: FileNode[],
  id: string,
  newName: string
): FileNode[] => {
  return mapTree(nodes, n => (n.id === id ? { ...n, name: newName } : n));
};

export const findNodeAndPath = (
  nodes: FileNode[],
  id: string
): { node: FileNode | null; pathIds: string[]; pathNames: string[] } => {
  const pathIds: string[] = [];
  const pathNames: string[] = [];
  let found: FileNode | null = null;

  function dfs(list: FileNode[], accIds: string[], accNames: string[]) {
    for (const n of list) {
      const ids = [...accIds, n.id];
      const names = [...accNames, n.name];
      if (n.id === id) {
        found = n;
        pathIds.push(...ids);
        pathNames.push(...names);
        return true;
      }
      if (n.type === 'folder' && n.children && dfs(n.children, ids, names)) {
        return true;
      }
    }
    return false;
  }

  dfs(nodes, [], []);
  return { node: found, pathIds, pathNames };
};
