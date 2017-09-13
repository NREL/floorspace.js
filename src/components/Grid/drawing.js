import _ from 'lodash';

const d3 = require('d3');

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
