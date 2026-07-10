import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import UploadIcon from '@mui/icons-material/Upload';
import { FileEditor } from './FileEditor';
import {
  EditorFile,
  createFile,
  deleteFile,
  getFile,
  isFileKey,
  listFiles,
  saveFile,
} from '../storage/fileStore';
import { parseYaml, toYaml } from '../utils/yaml';

export const FileWorkspace: FC = () => {
  const [files, setFiles] = useState<EditorFile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<unknown>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const current = listFiles();
    setFiles(current);
    if (current.length > 0) {
      setSelectedId(current[0].id);
      setEditingData(current[0].data);
    }
  }, []);

  // Keep the file list in sync when other tabs change storage.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (isFileKey(event.key)) {
        setFiles(listFiles());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const selectFile = (id: string) => {
    const file = getFile(id);
    if (!file) {
      return;
    }
    setSelectedId(id);
    setEditingData(file.data);
  };

  // Autosave edits to the selected file (isolated per file).
  const handleEditorChange = (data: unknown) => {
    setEditingData(data);
    if (!selectedId) {
      return;
    }
    const current = getFile(selectedId);
    if (!current) {
      return;
    }
    const saved = saveFile({ ...current, data });
    setFiles((prev) => prev.map((f) => (f.id === saved.id ? saved : f)));
  };

  const handleNew = () => {
    const name = window.prompt('New file name', 'untitled.yaml');
    if (!name) {
      return;
    }
    const created = createFile(name, {});
    setFiles(listFiles());
    selectFile(created.id);
  };

  const handleRename = () => {
    if (!selectedId) {
      return;
    }
    const current = getFile(selectedId);
    if (!current) {
      return;
    }
    const name = window.prompt('Rename file', current.name);
    if (!name || name === current.name) {
      return;
    }
    saveFile({ ...current, name });
    setFiles(listFiles());
  };

  const handleDelete = (id: string) => {
    const file = getFile(id);
    if (file && !window.confirm(`Delete "${file.name}"?`)) {
      return;
    }
    deleteFile(id);
    const remaining = listFiles();
    setFiles(remaining);
    if (selectedId === id) {
      if (remaining.length > 0) {
        selectFile(remaining[0].id);
      } else {
        setSelectedId(null);
        setEditingData({});
      }
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    try {
      const data = parseYaml(await file.text());
      const created = createFile(file.name, data);
      setFiles(listFiles());
      selectFile(created.id);
    } catch (err) {
      window.alert(`Failed to parse YAML: ${(err as Error).message}`);
    }
  };

  const handleExport = () => {
    if (!selectedId) {
      return;
    }
    const current = getFile(selectedId);
    if (!current) {
      return;
    }
    const blob = new Blob([toYaml(current.data)], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = current.name;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const selectedFile = files.find((f) => f.id === selectedId) ?? null;

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, alignItems: 'flex-start' }}>
      <Paper
        variant="outlined"
        sx={{ width: 300, flexShrink: 0, p: 1.5 }}
        data-testid="file-list">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}>
          <Typography variant="h6">Files</Typography>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="New file">
              <IconButton
                size="small"
                onClick={handleNew}
                data-testid="new-file">
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Import YAML">
              <IconButton
                size="small"
                onClick={handleImportClick}
                data-testid="import-file">
                <UploadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Divider />
        <List dense>
          {files.map((file) => (
            <ListItem
              key={file.id}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  aria-label={`delete ${file.name}`}
                  onClick={() => handleDelete(file.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }>
              <ListItemButton
                selected={file.id === selectedId}
                onClick={() => selectFile(file.id)}>
                <ListItemText
                  primary={file.name}
                  primaryTypographyProps={{
                    noWrap: true,
                    title: file.name,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          {files.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
              No files yet. Create or import one.
            </Typography>
          )}
        </List>
        <input
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml"
          hidden
          onChange={handleImportChange}
          data-testid="import-input"
        />
      </Paper>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        {selectedFile ? (
          <>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
                {selectedFile.name}
              </Typography>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={handleRename}>
                Rename
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                data-testid="export-file">
                Export YAML
              </Button>
            </Stack>
            <FileEditor
              key={selectedFile.id}
              data={editingData}
              onChange={handleEditorChange}
            />
          </>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
            Select a file to start editing, or create a new one.
          </Typography>
        )}
      </Box>
    </Box>
  );
};
