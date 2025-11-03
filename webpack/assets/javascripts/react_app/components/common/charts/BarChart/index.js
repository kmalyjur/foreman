import React from 'react';
import PropTypes from 'prop-types';
import {
  Chart,
  ChartBar,
  ChartAxis,
  ChartGroup,
  ChartThemeColor,
} from '@patternfly/react-charts';
import { noop } from '../../../../common/helpers';
import { translate as __ } from '../../../../common/I18n';
import MessageBox from '../../MessageBox';

// Transform data for PatternFly 5 format
const transformData = rawData => {
  if (!rawData || !Array.isArray(rawData)) return [];

  return rawData.map(item => ({
    x: item[0], // label
    y: item[1], // value
    name: item[0],
    color: item[2] || undefined, // custom color if provided
  }));
};

const BarChart = ({
  data,
  onclick,
  noDataMsg,
  config,
  title,
  xAxisLabel,
  yAxisLabel,
}) => {
  const chartData = transformData(data);
  const hasCustomColors = chartData.some(d => d.color);

  // Handle empty data
  if (!chartData.length) {
    return <MessageBox msg={noDataMsg} icontype="info" />;
  }

  // Configuration based on size (width is for viewBox aspect ratio, actual width is 100%)
  const getChartDimensions = () => {
    switch (config) {
      case 'small':
        return { height: 250, width: 600 };
      case 'medium':
        return { height: 280, width: 600 };
      case 'regular':
      default:
        return { height: 300, width: 600 };
    }
  };

  const dimensions = getChartDimensions();

  // Handle click events
  const handleBarClick = (event, clickedData) => {
    if (onclick && typeof onclick === 'function') {
      // Transform back to original format for compatibility
      const originalData = [clickedData.name, clickedData.y];
      onclick(originalData);
    }
  };

  return (
    <div style={{ height: dimensions.height + 60, width: '100%' }}>
      <Chart
        ariaDesc={title?.text || 'Bar chart'}
        ariaTitle={title?.text || 'Bar chart'}
        domainPadding={{ x: [30, 25] }}
        height={dimensions.height}
        width={dimensions.width}
        themeColor={ChartThemeColor.multi}
        padding={{
          bottom: 60,
          left: 70,
          right: 20,
          top: 10,
        }}
      >
        <ChartAxis
          dependentAxis
          showGrid
          label={yAxisLabel}
          tickFormat={t => String(Math.round(t))}
        />
        <ChartAxis
          label={xAxisLabel}
          tickFormat={t => {
            const str = String(t);
            return str.length > 10 ? `${str.substring(0, 10)}...` : str;
          }}
        />
        <ChartGroup>
          <ChartBar
            data={chartData}
            onClick={handleBarClick}
            style={
              hasCustomColors
                ? { data: { fill: ({ datum }) => datum.color } }
                : undefined
            }
          />
        </ChartGroup>
      </Chart>
    </div>
  );
};

BarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.array),
  onclick: PropTypes.func,
  noDataMsg: PropTypes.string,
  config: PropTypes.string,
  title: PropTypes.shape({
    type: PropTypes.string,
    text: PropTypes.string,
  }),
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string,
};

BarChart.defaultProps = {
  data: null,
  onclick: noop,
  noDataMsg: __('No data available'),
  config: 'regular',
  title: { type: 'percent' },
  yAxisLabel: '',
  xAxisLabel: '',
};

export default BarChart;
