import { FC, useMemo, useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import {
  materialCells,
  materialRenderers,
} from '@jsonforms/material-renderers';
import RatingControl from './RatingControl';
import ratingControlTester from '../ratingControlTester';
import DatasetMapControl from './DatasetMapControl';
import datasetMapControlTester from '../datasetMapControlTester';
import schema from '../schema.json';
import uischema from '../uischema.json';

const classes = {
  container: {
    width: '100%',
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
    padding: '0.5rem',
  },
};

const renderers = [
  ...materialRenderers,
  //register custom renderers
  { tester: ratingControlTester, renderer: RatingControl },
  { tester: datasetMapControlTester, renderer: DatasetMapControl },
];

const config = {
  showUnfocusedDescription: true,
};

export interface FileEditorProps {
  data: unknown;
  onChange: (data: unknown) => void;
}

export const FileEditor: FC<FileEditorProps> = ({ data, onChange }) => {
  const [tab, setTab] = useState(0);
  const stringifiedData = useMemo(() => JSON.stringify(data, null, 2), [data]);

  const clearData = () => {
    onChange({});
  };

  return (
    <Box style={classes.container}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tab}
          onChange={(_event, newValue) => setTab(newValue)}
          centered>
          <Tab label="Bound data" data-testid="tab-bound-data" />
          <Tab label="Rendered form" data-testid="tab-rendered-form" />
        </Tabs>
      </Box>
      {tab === 0 && (
        <Box role="tabpanel" sx={{ pt: 2 }}>
          <div style={classes.dataContent}>
            <pre id="boundData">{stringifiedData}</pre>
          </div>
          <Button
            style={classes.resetButton}
            onClick={clearData}
            color="primary"
            variant="contained"
            data-testid="clear-data">
            Clear data
          </Button>
        </Box>
      )}
      {tab === 1 && (
        <Box role="tabpanel" sx={{ pt: 2 }}>
          <div style={classes.demoform}>
            <JsonForms
              schema={schema}
              uischema={uischema}
              data={data}
              renderers={renderers}
              cells={materialCells}
              config={config}
              onChange={({ data }) => onChange(data)}
            />
          </div>
        </Box>
      )}
    </Box>
  );
};
