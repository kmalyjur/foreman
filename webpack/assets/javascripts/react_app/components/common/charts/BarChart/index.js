import React from 'react';
import PropTypes from 'prop-types';
import {
  Chart,
  ChartBar,
  ChartAxis,
  ChartThemeColor,
  ChartTooltip,
  ChartVoronoiContainer,
  getTheme,
} from '@patternfly/react-charts';
import { noop } from '../../../../common/helpers';
import { translate as __ } from '../../../../common/I18n';
import MessageBox from '../../MessageBox';
import BarChartHtmlTooltip from './BarChartHtmlTooltip';
import './BarChart.scss';

const transformData = rawData => {
  if (!rawData || !Array.isArray(rawData)) return [];

  return rawData.map((item, index) => ({
    x: item?.x ?? item[0], // label
    y: item?.y ?? item[1], // value
    name: item?.name ?? item?.x ?? item[0],
    color: item?.color ?? (item[2] || undefined), // custom color if provided
  }));
};

const CHART_WIDTH = 600;
const CHART_HEIGHTS = {
  small: 250,
  medium: 280,
  regular: 300,
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
  const theme = getTheme(ChartThemeColor.multi);
  const colorScale = theme?.bar?.colorScale || theme?.chart?.colorScale || [];
  const getDatumIndex = datum => {
    if (typeof datum?._index === 'number') return datum._index;
    if (typeof datum?.index === 'number') return datum.index;
    return 0;
  };
  const getLegendColor = ({ datum }) => {
    if (datum?.color) return datum.color;
    const index = getDatumIndex(datum);
    if (!colorScale.length) {
      return 'var(--pf-v5-global--Color--100)';
    }
    return colorScale[index % colorScale.length];
  };
  const getTooltipValue = datum => {
    const value = Number(datum?.y);
    return Number.isFinite(value) ? value.toFixed(1) : '';
  };
  const getTooltipTitle = datum => String(datum?.x ?? datum?.name ?? '');

  // Handle empty data
  if (!chartData.length) {
    return <MessageBox msg={noDataMsg} icontype="info" />;
  }

  const dimensions = {
    height: CHART_HEIGHTS[config] || CHART_HEIGHTS.regular,
    width: CHART_WIDTH,
  };

  const chartPadding = {
    bottom: 60,
    left: 70,
    right: 20,
    top: 10,
  };
  const tooltipWidth = 140;
  const tooltipHeight = 70;
  const tooltipPadding = 10;

  // Handle click events
  const handleBarClick = (event, clickedData) => {
    if (onclick && typeof onclick === 'function') {
      // Transform back to original format for compatibility
      const originalData = [clickedData.name, clickedData.y];
      onclick(originalData);
    }
  };

  return (
    <div
      className={`bar-chart__container bar-chart__container--${config ||
        'regular'}`}
    >
      <Chart
        ariaDesc={title?.text || 'Bar chart'}
        domainPadding={{ x: [30, 25] }}
        height={dimensions.height}
        width={dimensions.width}
        themeColor={ChartThemeColor.multi}
        containerComponent={
          <ChartVoronoiContainer
            labels={() => ' '}
            labelComponent={
              <ChartTooltip
                constrainToVisibleArea
                renderInPortal={false}
                orientation="top"
                pointerLength={8}
                flyoutStyle={{ fill: 'transparent', stroke: 'transparent' }}
                flyoutPadding={0}
                flyoutWidth={140}
                flyoutHeight={70}
                labelComponent={
                  <BarChartHtmlTooltip
                    dimensions={dimensions}
                    tooltipWidth={tooltipWidth}
                    tooltipHeight={tooltipHeight}
                    tooltipPadding={tooltipPadding}
                    getTooltipTitle={getTooltipTitle}
                    getTooltipValue={getTooltipValue}
                    getLegendColor={getLegendColor}
                  />
                }
              />
            }
            voronoiDimension="x"
            activateData
            activateLabels
          />
        }
        padding={chartPadding}
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
        <ChartBar
          data={chartData}
          onClick={handleBarClick}
          style={
            hasCustomColors
              ? { data: { fill: chartDatum => chartDatum?.datum?.color } }
              : undefined
          }
        />
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
