import _ from 'lodash';

const d3 = require('d3');

export function drawWindow() {
  let
    xScale = _.identity,
    yScale = _.identity;
  function chart(selection) {
    selection.each(function(data) {
      let wind = d3.select(this).selectAll('.window')
        .data([data]);

      wind.exit().remove();

      const windEnter = wind.enter().append('line').attr('class', 'window');

      wind = wind.merge(windEnter);
      wind
        .attr('x1', d => xScale(d.start.x))
        .attr('y1', d => yScale(d.start.y))
        .attr('x2', d => xScale(d.end.x))
        .attr('y2', d => yScale(d.end.y))
        .attr('marker-end', 'url(#perp-linecap)')
        .attr('marker-start', 'url(#perp-linecap)');
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
