import FileSystemManager from '../../lib/file_system_manager';

import * as React from 'react';
import { useEffect } from 'react';

import {
  Box,
  Paper,
  Toolbar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Collapse,
  Tooltip,
  Menu,
  MenuItem,
  TextField,
  Typography,
  Divider,
} from '@mui/material';

import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  ExpandLess,
  ExpandMore,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import {
  useStableCallback,
  filterTreeByIds,
  renameInTree,
  findNodeAndPath,
} from './utils';
import FileSystemStorage from '../../lib/opfs_wrapper';

export type FileNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileNode[];
};

type FileTreeProps = {
  data?: FileNode[];
  onOpenFolder?: (
    node: FileNode,
    pathIds: string[],
    pathNames: string[]
  ) => void;
  onRename?: (node: FileNode, newName: string) => void;
  onDelete?: (deletedNodes: FileNode[]) => void;
  multiSelect?: boolean;
  height?: number | string;
  title?: string;
  fsManager: FileSystemManager;
  useNativeSystem?: boolean;
};

export function FileTree({
  data = [],
  onOpenFolder,
  onRename,
  onDelete,
  multiSelect = true,
  height = 520,
  title = 'Files',
  fsManager,
  useNativeSystem = false,
}: FileTreeProps) {
  useEffect(() => {
    if (!useNativeSystem) {
      (async () => {
        // TODO rewrite to avoid use  fs.init
        const fs = new FileSystemStorage();
        await fs.init();
        const files = await fsManager.select();
        setTree(files as []);
      })();
    }
  }, [useNativeSystem]);

  const [tree, setTree] = React.useState<FileNode[]>(data);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [renamingId, setRenamingId] = React.useState<string | null>(null);

  // Action menu state
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [menuNodeId, setMenuNodeId] = React.useState<string | null>(null);

  const openFolderCb = useStableCallback(
    onOpenFolder,
    (node: FileNode, pathIds: string[], pathNames: string[]) => {
      // no-op default
    }
  );
  const renameCb = useStableCallback(
    onRename,
    (node: FileNode, newName: string) => {}
  );
  const deleteCb = useStableCallback(onDelete, (deleted: FileNode[]) => {});

  // Handlers
  const toggleExpanded = React.useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectToggle = React.useCallback(
    (id: string) => {
      setSelected(prev => {
        const next = new Set(prev);
        if (multiSelect) {
          if (next.has(id)) next.delete(id);
          else next.add(id);
        } else {
          next.clear();
          next.add(id);
        }
        return next;
      });
    },
    [multiSelect]
  );

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuNodeId(id);
  };
  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuNodeId(null);
  };

  const commitRename = async (id: string, newName: string) => {
    await fsManager.renameFile(id, newName);

    const trimmed = newName.trim();
    if (!trimmed) {
      setRenamingId(null);
      return;
    }
    const { node } = findNodeAndPath(tree, id);
    setTree(prev => renameInTree(prev, id, trimmed));
    if (node) renameCb(node, trimmed);
    setRenamingId(null);

    const files = await fsManager.select();
    setTree(files as []);
  };

  const deleteByIds = async (idsToDelete: Set<string>) => {
    console.log('idsToDelete', idsToDelete);
    for (const id of idsToDelete) {
      await fsManager.deleteFile(id);
    }
    setTree(prev => {
      const { next, deleted } = filterTreeByIds(prev, idsToDelete);
      deleteCb(deleted);
      return next;
    });
    setSelected(_ => new Set());
    // Also collapse any expanded folders that no longer exist
    setExpanded(prev => {
      const next = new Set(prev);
      for (const id of idsToDelete) next.delete(id);
      return next;
    });
  };

  const handleMenuRename = () => {
    if (!menuNodeId) return;
    setRenamingId(menuNodeId);
    handleCloseMenu();
  };

  const handleMenuDelete = () => {
    if (!menuNodeId) return;
    deleteByIds(new Set([menuNodeId]));
    handleCloseMenu();
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    deleteByIds(new Set(selected));
  };

  // Render tree
  const renderNode = (
    node: FileNode,
    depth: number,
    parentPathIds: string[],
    parentPathNames: string[]
  ) => {
    const isFolder = node.type === 'folder';
    const isOpen = expanded.has(node.id);
    const isSelected = selected.has(node.id);
    const pathIds = [...parentPathIds, node.id];
    const pathNames = [...parentPathNames, node.name];

    const onDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isFolder) {
        toggleExpanded(node.id);
        openFolderCb(node, pathIds, pathNames);
      }
    };

    const onStartRename = (e: React.MouseEvent) => {
      e.stopPropagation();
      setRenamingId(node.id);
    };

    const secondaryActions = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {/* Quick rename and delete icons */}
        <Tooltip title='Rename'>
          <IconButton
            size='small'
            aria-label='Rename'
            onClick={e => {
              e.stopPropagation();
              onStartRename(e);
            }}
          >
            <EditIcon fontSize='small' />
          </IconButton>
        </Tooltip>
        <Tooltip title='Delete'>
          <IconButton
            size='small'
            color='error'
            aria-label='Delete'
            onClick={e => {
              e.stopPropagation();
              deleteByIds(new Set([node.id]));
            }}
          >
            <DeleteIcon fontSize='small' />
          </IconButton>
        </Tooltip>
        {/* Kebab menu */}
        <IconButton
          aria-label='More'
          size='small'
          onClick={e => handleOpenMenu(e, node.id)}
          sx={{ ml: 0.5 }}
        >
          <MoreVertIcon fontSize='small' />
        </IconButton>
      </Box>
    );

    return (
      <React.Fragment key={node.id}>
        <ListItem
          disableGutters
          sx={{
            pl: 1.5 + depth * 2,
            pr: 1,
            py: 0.25,
            userSelect: 'none',
            '&:hover': { bgcolor: 'action.hover' },
          }}
          onDoubleClick={onDoubleClick}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Checkbox
              size='small'
              edge='start'
              checked={isSelected}
              onClick={e => e.stopPropagation()}
              onChange={() => handleSelectToggle(node.id)}
              inputProps={{ 'aria-label': `select ${node.name}` }}
            />
          </ListItemIcon>

          {isFolder ? (
            <IconButton
              size='small'
              aria-label={isOpen ? 'Collapse' : 'Expand'}
              onClick={e => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
              sx={{ mr: 0.5 }}
            >
              {isOpen ? (
                <ExpandLess fontSize='small' />
              ) : (
                <ExpandMore fontSize='small' />
              )}
            </IconButton>
          ) : (
            <Box
              sx={{
                width: 28,
                display: 'inline-flex',
                justifyContent: 'center',
                mr: 0.5,
              }}
            />
          )}

          <ListItemIcon sx={{ minWidth: 28 }}>
            {isFolder ? (
              <FolderIcon fontSize='small' />
            ) : (
              <FileIcon fontSize='small' />
            )}
          </ListItemIcon>

          {renamingId === node.id ? (
            <TextField
              size='small'
              defaultValue={node.name}
              autoFocus
              onClick={e => e.stopPropagation()}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  commitRename(node.id, (e.target as HTMLInputElement).value);
                } else if (e.key === 'Escape') {
                  setRenamingId(null);
                }
              }}
              onBlur={e => commitRename(node.id, e.target.value)}
              inputProps={{ 'aria-label': `Rename ${node.name}` }}
              sx={{ mr: 1, flexGrow: 1 }}
            />
          ) : (
            <ListItemText
              primary={
                <Typography variant='body2' noWrap>
                  {node.name}
                </Typography>
              }
              onClick={e => {
                // For convenience: clicking text toggles selection
                handleSelectToggle(node.id);
              }}
              sx={{ mr: 1 }}
            />
          )}

          {secondaryActions}
        </ListItem>

        {isFolder && (
          <Collapse in={isOpen} timeout='auto' unmountOnExit>
            <List disablePadding>
              {(node.children ?? []).map(child =>
                renderNode(child, depth + 1, pathIds, pathNames)
              )}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const flatHasItems = tree.length > 0;

  const createFile = async () => {
    try {
      const now = new Date()
        .toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
        .replace(/:/g, '-');
      const fileName = `${now}.txt`;
      await fsManager.create(fileName, 'document content', {
        create: true,
      });
    } catch (error) {
      console.log('Error in createFile', error);
    }
  };

  const printInConsole = async () => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;
    const content = await fsManager.readFile(fileName);
    console.log('content', content);
  };

  const createDirectory = async () => {
    const directoryName = prompt('Enter directory name:');
    if (!directoryName) return;
    await fsManager.createDirectory(directoryName);
  };

  return (
    <Paper
      elevation={0}
      variant='outlined'
      sx={{
        width: '100%',
        height,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 1.5,
        overflow: 'hidden',
      }}
    >
      <Toolbar
        variant='dense'
        sx={{
          gap: 1,
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
          {title}
        </Typography>

        <Box>
          <Button
            variant='contained'
            color='primary'
            size='small'
            onClick={createDirectory}
          >
            Create directory
          </Button>
        </Box>
        <Box>
          <Button
            variant='contained'
            color='primary'
            size='small'
            onClick={createFile}
          >
            Create file
          </Button>
        </Box>
        <Box>
          <Button
            variant='contained'
            color='primary'
            size='small'
            onClick={printInConsole}
          >
            Print in console
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {selected.size > 0 && (
            <Tooltip title={`Delete ${selected.size} selected`}>
              <Button
                variant='contained'
                color='error'
                size='small'
                startIcon={<DeleteIcon />}
                onClick={handleBulkDelete}
              >
                {'Delete'}
              </Button>
            </Tooltip>
          )}
        </Box>
      </Toolbar>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {!flatHasItems ? (
          <Box sx={{ p: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              {'No files or folders.'}
              {useNativeSystem && (
                <Button
                  variant='contained'
                  color='primary'
                  size='small'
                  onClick={async () => {
                    await fsManager.showDirectoryPicker();
                    const files = await fsManager.select();
                    setTree(files as []);
                    console.log('files', files);
                  }}
                >
                  {'Select working directory'}
                </Button>
              )}
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {tree.map(n => renderNode(n, 0, [], []))}
          </List>
        )}
      </Box>

      <Divider />

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleMenuRename} dense>
          <EditIcon fontSize='small' sx={{ mr: 1 }} />
          {'Rename'}
        </MenuItem>
        <MenuItem onClick={handleMenuDelete} dense sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize='small' sx={{ mr: 1 }} />
          {'Delete'}
        </MenuItem>
      </Menu>
    </Paper>
  );
}

export default FileTree;
