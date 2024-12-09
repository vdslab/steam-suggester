import { Slider, Rail, Handles, Tracks } from 'react-compound-slider';

type Props = {
  domain: [number, number];
  values: number[];
  onChange: (values: number[]) => void;
  valueFormatter: (value: number) => string;
  disabled: boolean;
};

const FilterSlider = (props: Props) => {

  const { domain, values, onChange, valueFormatter, disabled } = props;

  const handleChange = (newValues: readonly number[]) => {
    onChange([...newValues]);
  };

  return (
    <div style={{ margin: '10px 0 50px 0', opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span>{valueFormatter(values[0])}</span>
        <span>{valueFormatter(values[1])}</span>
      </div>
      <Slider
        mode={2}
        step={1}
        domain={domain}
        rootStyle={{ position: 'relative', width: '100%' }}
        onUpdate={handleChange}
        values={values}
      >
        <Rail>
          {({ getRailProps }) => (
            <div style={{ position: 'absolute', width: '100%', height: 8, borderRadius: 4, backgroundColor: '#ddd' }} {...getRailProps()} />
          )}
        </Rail>
        <Handles>
          {({ handles, getHandleProps }) => (
            <div className="slider-handles">
              {handles.map(handle => (
                <div key={handle.id} style={{ left: `${handle.percent}%`, position: 'absolute', marginLeft: -11, marginTop: -5, width: 20, height: 20, zIndex: 1, cursor: 'pointer', backgroundColor: '#fff', borderRadius: '50%' }} {...getHandleProps(handle.id)} />
              ))}
            </div>
          )}
        </Handles>
        <Tracks left={false} right={false}>
          {({ tracks, getTrackProps }) => (
            <div className="slider-tracks">
              {tracks.map(({ id, source, target }) => (
                <div key={id} style={{ position: 'absolute', height: 8, backgroundColor: '#548BF4', borderRadius: 4, left: `${source.percent}%`, width: `${target.percent - source.percent}%` }} {...getTrackProps()} />
              ))}
            </div>
          )}
        </Tracks>
      </Slider>
    </div>
  );
};

export default FilterSlider;