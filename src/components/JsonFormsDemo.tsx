import { ChangeEvent, FC, useMemo, useRef, useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import {
  materialCells,
  materialRenderers,
} from '@jsonforms/material-renderers';
import RatingControl from './RatingControl';
import ratingControlTester from '../ratingControlTester';
import { parseYaml, toYaml } from '../utils/yaml';
import schema from '../schema.json';
import uischema from '../uischema.json';

const classes = {
  container: {
    padding: '1em',
    width: '100%',
  },
  title: {
    textAlign: 'center',
    padding: '0.25em',
  },
  dataContent: {
    borderRadius: '0.25em',
    backgroundColor: '#cecece',
    marginBottom: '1rem',
    overflowX: 'auto' as const,
  },
  resetButton: {
    margin: 'auto !important',
    display: 'block !important',
  },
  demoform: {
    margin: 'auto',
    padding: '1rem',
  },
};

const initialData = {
  name: 'Send email to Adrian',
  description: 'Confirm if you have passed the subject\nHereby ...',
  done: true,
  recurrence: 'Daily',
  rating: 3,
};

const renderers = [
  ...materialRenderers,
  //register custom renderers
  { tester: ratingControlTester, renderer: RatingControl },
];

export const JsonFormsDemo: FC = () => {
  const [data, setData] = useState<object>(initialData);
  const yamlData = useMemo(() => toYaml(data), [data]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearData = () => {
    setData({});
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    try {
      setData(parseYaml(await file.text()) as object);
    } catch (err) {
      window.alert(`Failed to parse YAML: ${(err as Error).message}`);
    }
  };

  const handleExport = () => {
    const blob = new Blob([yamlData], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'data.yaml';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Grid
      container
      justifyContent={'center'}
      spacing={1}
      style={classes.container}>
      <Grid size={{ sm: 6 }}>
        <Typography variant={'h4'}>Bound data</Typography>
        <div style={classes.dataContent}>
          <pre id="boundData" data-testid="boundData">{yamlData}</pre>
        </div>
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={handleImportClick}
            data-testid="import-yaml">
            Import YAML
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            data-testid="export-yaml">
            Export YAML
          </Button>
        </Stack>
        <Button
          style={classes.resetButton}
          onClick={clearData}
          color="primary"
          variant="contained"
          data-testid="clear-data">
          Clear data
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml"
          hidden
          onChange={handleImportChange}
          data-testid="import-input"
        />
      </Grid>
      <Grid size={{ sm: 6 }}>
        <Typography variant={'h4'}>Rendered form</Typography>
        <div style={classes.demoform}>
          <JsonForms
            schema={schema}
            uischema={uischema}
            data={data}
            renderers={renderers}
            cells={materialCells}
            onChange={({ data }) => setData(data)}
          />
        </div>
      </Grid>
    </Grid>
  );
};
