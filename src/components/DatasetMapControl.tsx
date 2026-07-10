import { useMemo, useState } from 'react';
import { ControlProps, Generate, JsonSchema } from '@jsonforms/core';
import {
  JsonFormsDispatch,
  useJsonForms,
  withJsonFormsControlProps,
} from '@jsonforms/react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';

type DatasetEntries = Record<string, unknown>;

const DatasetMapControl = ({
  data,
  handleChange,
  path,
  schema,
  label,
  visible,
  enabled,
}: ControlProps) => {
  const ctx = useJsonForms();
  const [newKey, setNewKey] = useState('');

  const itemSchema = schema.additionalProperties as JsonSchema;
  const itemUiSchema = useMemo(
    () => Generate.uiSchema(itemSchema, 'VerticalLayout'),
    [itemSchema]
  );

  const entries: DatasetEntries =
    data && typeof data === 'object' ? (data as DatasetEntries) : {};
  const keys = Object.keys(entries);

  if (!visible) {
    return null;
  }

  const addEntry = () => {
    const key = newKey.trim();
    if (!key || Object.prototype.hasOwnProperty.call(entries, key)) {
      return;
    }
    handleChange(path, { ...entries, [key]: {} });
    setNewKey('');
  };

  const removeEntry = (key: string) => {
    const next = { ...entries };
    delete next[key];
    handleChange(path, next);
  };

  return (
    <Box>
      {label && (
        <Typography variant="h6" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      {keys.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          No entries yet. Add a named test case below.
        </Typography>
      )}
      {keys.map((key) => (
        <Accordion key={key} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>
                {key}
              </Typography>
              <IconButton
                component="span"
                size="small"
                aria-label={`delete ${key}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeEntry(key);
                }}
                disabled={!enabled}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <JsonFormsDispatch
              schema={itemSchema}
              uischema={itemUiSchema}
              path={`${path}.${key}`}
              renderers={ctx.renderers}
              cells={ctx.cells}
              enabled={enabled}
            />
          </AccordionDetails>
        </Accordion>
      ))}
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <TextField
          size="small"
          label="New test case name"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addEntry();
            }
          }}
          disabled={!enabled}
        />
        <Button
          variant="contained"
          onClick={addEntry}
          disabled={!enabled || !newKey.trim()}
          data-testid="add-dataset-entry">
          Add
        </Button>
      </Stack>
    </Box>
  );
};

// Fast refresh can't handle anonymous components.
const DatasetMapControlWithJsonForms =
  withJsonFormsControlProps(DatasetMapControl);
export default DatasetMapControlWithJsonForms;
