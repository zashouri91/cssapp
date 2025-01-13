import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

interface Location {
  name: string;
  coordinates: [number, number];
  value: number;
}

interface LocationHeatmapProps {
  data: Location[];
}

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

export function LocationHeatmap({ data }: LocationHeatmapProps) {
  // Create a scale for the marker size based on values
  const maxValue = Math.max(...data.map(d => d.value));
  const sizeScale = scaleLinear()
    .domain([0, maxValue])
    .range([5, 20]);

  // Create a scale for the marker color based on values
  const colorScale = scaleLinear<string>()
    .domain([0, maxValue])
    .range(['#FEE2E2', '#EF4444']);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Response Distribution by Location</h3>
      <div style={{ width: '100%', height: '400px' }}>
        <ComposableMap
          projectionConfig={{
            scale: 147,
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#F5F5F5"
                  stroke="#D4D4D4"
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>
          {data.map(({ name, coordinates, value }) => (
            <Marker key={name} coordinates={coordinates}>
              <circle
                r={sizeScale(value)}
                fill={colorScale(value)}
                stroke="#FFF"
                strokeWidth={2}
                style={{
                  cursor: 'pointer',
                }}
              />
              <title>{`${name}: ${value} responses`}</title>
            </Marker>
          ))}
        </ComposableMap>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Circle size and color intensity indicate response volume
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: '#FEE2E2' }}
            />
            <span className="text-xs text-gray-500">Low</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: '#EF4444' }}
            />
            <span className="text-xs text-gray-500">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
