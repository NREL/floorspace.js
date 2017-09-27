import 'd3-selection-multi';
import _ from 'lodash';
import { distanceBetweenPoints, unitPerpVector, unitVector, edgeDirection } from './../../store/modules/geometry/helpers';

export function drawWindow() {
  let
    xScale = _.identity,
    yScale = _.identity,
    highlight = false;
  function chart(selection) {
    selection.exit().remove();
    const windowE = selection.enter().append('g').attr('class', 'window');
    windowE.append('line');
    windowE.append('circle');
    const windw = selection.merge(windowE);
    windw.select('line')
      .attr('x1', d => xScale(d.start.x))
      .attr('y1', d => yScale(d.start.y))
      .attr('x2', d => xScale(d.end.x))
      .attr('y2', d => yScale(d.end.y))
      .attr('marker-end', `url(#perp-linecap${highlight ? '-highlight' : ''})`)
      .attr('marker-start', `url(#perp-linecap${highlight ? '-highlight' : ''})`);
    windw.select('circle')
      .attr('cx', d => xScale(d.center.x))
      .attr('cy', d => yScale(d.center.y))
      .attr('r', '2');
  }

  chart.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return chart;
  };
  chart.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return chart;
  };
  chart.highlight = function(_) {
    if (!arguments.length) return highlight;
    highlight = _;
    return chart;
  };

  return chart;
}

function distanceMeasure() {
  let
    xScale = _.identity,
    yScale = _.identity,
    lineOffset = 20,
    labelPosition = 1;
  function chart(selection) {
    selection.exit().remove();
    const measureE = selection.enter().append('g')
      .attr('class', 'distance-measure')
      .attr('transform', (d) => {
        const { dx, dy } = unitPerpVector(d.start, d.end),
          offX = lineOffset * dx,
          offY = lineOffset * dy;
        return `translate(${offX}, ${offY})`;
      });
    measureE.append('line');
    measureE.append('text');
    measureE.append('path').attr('class', 'start');
    measureE.append('path').attr('class', 'end');

    const measure = selection.merge(measureE);

    measure.select('text')
      .attr('x', d => (1 - labelPosition) * xScale(d.start.x) + labelPosition * xScale(d.end.x))
      .attr('y', d => (1 - labelPosition) * yScale(d.start.y) + labelPosition * yScale(d.end.y))
      .attr('dominant-baseline', 'text-before-edge')
      .attrs((d) => {
        const
          { dx, dy } = unitPerpVector(d.start, d.end),
          offset = 4;
        return {
          dx: dx * offset,
          dy: dy * offset,
        };
      })
      .text((d) => {
        const
          distance = distanceBetweenPoints(d.start, d.end),
          roundDistance = Math.round(distance * 100) / 100;
        return `${roundDistance}`;
      });
    measure.select('line')
      .attrs((d) => {
        const { dx, dy } = unitVector(d.start, d.end),
          offset = 11.5,
          offX = dx * offset,
          offY = dy * offset;

        return {
          x1: xScale(d.start.x) + offX,
          y1: yScale(d.start.y) - offY,
          x2: xScale(d.end.x) - offX,
          y2: yScale(d.end.y) + offY,
        };
      });
    const
      arrowHead = 'M -6,-2 V 2 L0,0 Z',
      rotate = (d) => {
        // did ya ever... did ya ever program by guess and check?
        const
          angle = (edgeDirection(d) * 180) / Math.PI,
          adjust = d.start.x === d.end.x ?
                    (d.start.y > d.end.y ? 0 : 180) :
                    (d.start.x > d.end.x ? 0 : 180);

        return adjust - angle;
      };

    measure.select('path.start')
      .attr('transform',
        d => `translate(${xScale(d.start.x)}, ${yScale(d.start.y)}) scale(2) rotate(${rotate(d)})`)
      .attr('d', arrowHead);

    measure.select('path.end')
      .attr('transform',
        d => `translate(${xScale(d.end.x)}, ${yScale(d.end.y)}) scale(2) rotate(${180 + rotate(d)})`)
      .attr('d', arrowHead);
  }
  chart.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return chart;
  };
  chart.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return chart;
  };
  chart.lineOffset = function(_) {
    if (!arguments.length) return lineOffset;
    lineOffset = _;
    return chart;
  };
  chart.labelPosition = function(_) {
    if (!arguments.length) return labelPosition;
    if (_ < 0 || _ > 1) {
      console.warn(`Expected labelPosition to be in [0, 1] (got ${_})`);
    }
    labelPosition = _;
    return chart;
  };

  return chart;
}

export function drawWindowGuideline() {
  let
    xScale = _.identity,
    yScale = _.identity;
  const drawMeasure = distanceMeasure();
  function chart(selection) {
    drawMeasure.xScale(xScale).yScale(yScale);
    selection.exit().remove();
    selection
      .merge(selection.enter().append('g').classed('window-guideline', true))
      .selectAll('.distance-measure')
      .data(
        // there must be a better way to do this...
        selection.merge(selection.enter()).data()
        .map(d => ({ start: d.edge_start, end: d.center }))
      )
      .call(drawMeasure);
  }

  chart.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return chart;
  };
  chart.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return chart;
  };
  return chart;
}


export function drawDaylightingControl() {
  let
    xScale = _.identity,
    yScale = _.identity;

  function chart(selection) {
    selection.exit().remove();
    const dcE = selection.enter().append('g').attr('class', 'daylighting-control');
    dcE.append('circle').attr('class', 'bg');
    dcE.append('path').attr('class', 'quadrants');
    const dc = selection.merge(dcE);
    dc.select('circle.bg')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 10);
    dc.select('path.quadrants')
      .attr('d', (d) => {
        const x = xScale(d.x), y = yScale(d.y), r = 10;
        return `M${x} ${y} L${x + r} ${y} A ${r} ${r} 0 0 1 ${x} ${y + r} L ${x} ${y - r} A ${r} ${r} 0 0 0 ${x - r} ${y} Z`;
      });
  }

  chart.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return chart;
  };
  chart.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return chart;
  };
  return chart;
}

export function drawDaylightingControlGuideline() {
  let
    xScale = _.identity,
    yScale = _.identity;
  const drawMeasure = distanceMeasure()
    .lineOffset(0)
    .labelPosition(0.5);
  function chart(selection) {
    drawMeasure.xScale(xScale).yScale(yScale);
    selection.exit().remove();
    const guideE = selection.enter().append('g')
      .classed('daylighting-control-guideline', true);

    const data = _.flatMap(
      selection.merge(selection.enter()).data(),
      (d) => {
        const
          dir = unitVector(d.nearestEdge.v1, d.nearestEdge.v2),
          v = { start: d.loc, end: d.nearestEdge.proj },
          dotProduct = ((v.end.x - v.start.x) * dir.dx) + ((v.end.y - v.start.y) * dir.dy),
          parallel = {
            start: v.start,
            end: {
              x: v.start.x + dotProduct * dir.dx,
              y: v.start.y + dotProduct * dir.dy,
            },
          },
          perp = {
            start: parallel.end,
            end: v.end,
          };
        return [v, perp, parallel].filter(
          ({ start, end }) => distanceBetweenPoints(start, end) > 0.01,
        );
      });
    const guide = selection.merge(guideE);
    guide
      .selectAll('.distance-measure')
      .data(data)
      .call(drawMeasure);
  }

  chart.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return chart;
  };
  chart.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return chart;
  };
  return chart;
}
