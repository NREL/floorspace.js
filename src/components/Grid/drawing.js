import * as d3 from 'd3';
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
    windowE.append('line').attr('class', 'pane');
    windowE.append('circle');
    windowE.append('line').attr('class', 'start-linecap');
    windowE.append('line').attr('class', 'end-linecap');
    const windw = selection.merge(windowE);
    windw.classed('selected', d => d.selected);
    windw.classed('facing-selection', d => d.facingSelection);
    windw.select('line.pane')
      .attr('x1', d => xScale(d.start.x))
      .attr('y1', d => yScale(d.start.y))
      .attr('x2', d => xScale(d.end.x))
      .attr('y2', d => yScale(d.end.y));
    windw.each(function (d) {
      const
        { dx, dy } = unitPerpVector(d.start, d.end),
        linecapOffset = 10;

      const $this = d3.select(this);
      $this.select('.start-linecap')
        .attr('x1', xScale(d.start.x) + linecapOffset * dx)
        .attr('y1', yScale(d.start.y) + linecapOffset * dy)
        .attr('x2', xScale(d.start.x) - linecapOffset * dx)
        .attr('y2', yScale(d.start.y) - linecapOffset * dy);
      $this.select('.end-linecap')
        .attr('x1', xScale(d.end.x) + linecapOffset * dx)
        .attr('y1', yScale(d.end.y) + linecapOffset * dy)
        .attr('x2', xScale(d.end.x) - linecapOffset * dx)
        .attr('y2', yScale(d.end.y) - linecapOffset * dy);
      if (d.selected || d.facingSelection) {
        $this.raise();
      }
    });
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
      .merge(selection.enter().append('g').classed('window-guideline component-guideline', true))
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
    dc.classed('selected', d => d.selected);
    dc.classed('facing-selection', d => d.facingSelection);
    dc.select('circle.bg')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 10);
    dc.select('path.quadrants')
      .attr('d', (d) => {
        const x = xScale(d.x), y = yScale(d.y), r = 10;
        return `M${x} ${y} L${x + r} ${y} A ${r} ${r} 0 0 1 ${x} ${y + r} L ${x} ${y - r} A ${r} ${r} 0 0 0 ${x - r} ${y} Z`;
      });
    dc.each(function (d) {
      if (d.selected || d.facingSelection) {
        d3.select(this).raise();
      }
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
      .classed('daylighting-control-guideline component-guideline', true);

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
const invRoot2 = 1 / Math.sqrt(2);
const RESIZE_CURSORS = [
  { vec: { x: 1, y: 0 }, cursor: 'ew-resize' },
  { vec: { x: -1, y: 0 }, cursor: 'ew-resize' },
  { vec: { x: 0, y: 1 }, cursor: 'ns-resize' },
  { vec: { x: 0, y: -1 }, cursor: 'ns-resize' },
  { vec: { x: invRoot2, y: invRoot2 }, cursor: 'nwse-resize' },
  { vec: { x: -1 * invRoot2, y: -1 * invRoot2 }, cursor: 'nwse-resize' },
  { vec: { x: invRoot2, y: -1 * invRoot2 }, cursor: 'nesw-resize' },
  { vec: { x: -1 * invRoot2, y: invRoot2 }, cursor: 'nesw-resize' },
]
function bestResizeCursor(xOff, yOff, rotation) {
  const
    norm = Math.sqrt(xOff * xOff + yOff * yOff),
    x = xOff / norm,
    y = yOff / norm,
    a = Math.PI * rotation / 180,
    pt = {
      x: x * Math.cos(a) - y * Math.sin(a),
      y: x * Math.sin(a) + y * Math.cos(a),
    };

  return _.minBy(RESIZE_CURSORS, c => distanceBetweenPoints(c.vec, pt)).cursor;
}
const rotateCursor = (
  'url(data:image/svg+xml;base64,' + // eslint-disable-line
  btoa(
'<svg xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="25.6" height="25.6" viewBox="0 0 25.6 25.6">' +
'  <path transform="scale(0.5)" d="M25.6,44.8c7.9406,0,14.4-6.4594,14.4-14.4s-6.4594-14.4-14.4-14.4v9.6L9.6,12.8L25.6,0v9.6c11.4688,0,20.8,9.3313,20.8,20.8s-9.3313,20.8-20.8,20.8S4.8,41.8688,4.8,30.4h6.4C11.2,38.3406,17.6594,44.8,25.6,44.8z"/>' +
'</svg>'
  ) +
  ') 12.8 12.8, pointer');

export function drawImage() {
  let
    xScale = _.identity,
    yScale = _.identity,
    updateImage = _.identity,
    selectImage = _.identity;
  function chart(selection) {
    const pxPerRWU = (xScale(100) - xScale(0)) / 100;

    let startX, startY, currX, currY;
    const
      offset = (d) => {
        const
          x = (currX - startX),
          y = (currY - startY),
          invR = -1 * d.r * Math.PI / 180;
        return {
          dx: x * Math.cos(invR) - y * Math.sin(invR),
          dy: x * Math.sin(invR) + y * Math.cos(invR),
        };
      },
      moveable = d3.drag()
      .on('start', function() {
        d3.event.sourceEvent.stopPropagation(); // don't zoom when I'm draggin' an image!
        [startX, startY] = d3.mouse(document.querySelector('#grid svg'));
        currX = currY = undefined;
      })
      .on('drag', function(d) {
        [currX, currY] = d3.mouse(document.querySelector('#grid svg'));
        const { dx, dy } = offset(d);
        d3.select(this)
          .attr('transform', `translate(${dx}, ${dy})`);
      })
      .on('end', function(d) {
        if (typeof currX === 'undefined') {
          // no movement since start of move.
          return;
        }
        const { dx, dy } = offset(d);
        updateImage({
          image: d,
          x: d.x + (currX - startX) / pxPerRWU,
          y: d.y - (currY - startY) / pxPerRWU,
        });
      });

    const
      scalingFactor = (d) => {
        const
          pxOrigin = { x: xScale(d.x), y: yScale(d.y) },
          distCurrToOrigin = distanceBetweenPoints(
            { x: currX, y: currY }, pxOrigin),
          distStartToOrigin = distanceBetweenPoints(
            { x: startX, y: startY }, pxOrigin),
          scale = distCurrToOrigin / distStartToOrigin;
        return scale;
      },
      resizeable = d3.drag()
        .on('start', function() {
          d3.event.sourceEvent.stopPropagation();
          [startX, startY] = d3.mouse(document.querySelector('#grid svg'));
          currX = currY = undefined;
        })
        .on('drag', function(d) {
          [currX, currY] = d3.mouse(document.querySelector('#grid svg'));
          d3.select(this.parentNode.parentNode)
            .attr('transform', `scale(${scalingFactor(d)})`);
        })
        .on('end', function(d) {
          if (typeof currX === 'undefined') {
            // no movement since start of resize.
            return;
          }
          const scale = scalingFactor(d);
          updateImage({
            image: d,
            width: d.width * scale,
            height: d.height * scale,
          });
        });

    const
      rotationAngle = (d) => {
        const
          pxOrigin = { x: xScale(d.x), y: yScale(d.y) },
          startAngle = edgeDirection({ start: pxOrigin, end: { x: startX, y: startY }}),
          currAngle = edgeDirection({ start: pxOrigin, end: { x: currX, y: currY }});
        return ((180 * (currAngle - startAngle) / Math.PI)
          + 180 * (xScale(d.x) > currX !== xScale(d.x) > startX)
        );
      },
      rotateable = d3.drag()
        .on('start', function() {
          d3.event.sourceEvent.stopPropagation();
          [startX, startY] = d3.mouse(document.querySelector('#grid svg'));
          currX = currY = undefined;
        })
        .on('drag', function(d) {
          [currX, currY] = d3.mouse(document.querySelector('#grid svg'));
          d3.select(this.parentNode.parentNode)
            .attr('transform', `rotate(${rotationAngle(d)})`);
        })
        .on('end', function(d) {
          if (typeof currX === 'undefined') {
            // no movement since start of rotation.
            return;
          }
          const rotation = rotationAngle(d);
          updateImage({
            image: d,
            r: rotation + d.r,
          });
        });

    selection.exit().remove();
    const imageGroupE = selection.enter().append('g').attr('class', 'image-group');
    const moveableWrapperE = imageGroupE.append('g').attr('class', 'moveable-wrapper');
    moveableWrapperE.append('image');
    const controlsE = moveableWrapperE.append('g').attr('class', 'controls');
    controlsE.append('line').attr('class', 'rotation-to-center');
    controlsE.append('circle').attr('class', 'rotation-handle');
    ['tl', 'tr', 'bl', 'br']
      .forEach(corner => controlsE.append('circle').attr('class', `corner ${corner}`));

    const imageGroup = selection.merge(imageGroupE);

    imageGroup
      .attr('transform', d => `translate(${xScale(d.x)}, ${yScale(d.y)}) rotate(${d.r})`);

    imageGroup.select('image')
      .attr('x', d => -1 * pxPerRWU * d.width / 2)
      .attr('y', d => -1 * pxPerRWU * d.height / 2)
      .attr('width', d => pxPerRWU * d.width)
      .attr('height', d => pxPerRWU * d.height)
      .attr('xlink:href', d => d.src);

    imageGroup.select('.moveable-wrapper')
      .attr('transform', 'translate(0,0)')
      .style('cursor', d => d.current ? 'move' : d.clickable ? 'pointer' : null);

    imageGroup.select('.controls')
      .attr('display', d => d.current ? '' : 'none');

    imageGroup.each(function(d) {
      const ig = d3.select(this);
      if (!d.clickable) {
        ig
          .on('click', null);
      } else {
        ig.on('click', (d) => {
          d3.event.stopPropagation();
          selectImage(d);
        });
      }
      if (!d.current) {
        ig.select('.moveable-wrapper, .rotation-handle, .corner')
          .on('.drag', null);
      } else {
        ig.select('.moveable-wrapper')
          .call(moveable);

        ig.select('.controls .center')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', 3);

        ig.select('.controls .rotation-handle')
          .attr('cx', 0)
          .attr('cy', pxPerRWU * d.height * 0.7)
          .attr('r', 5)
          .style('cursor', rotateCursor)
          .call(rotateable);
        ig.select('.controls .rotation-to-center')
          .attr('x1', 0)
          .attr('y1', pxPerRWU * d.height / 2)
          .attr('x2', 0)
          .attr('y2', pxPerRWU * d.height * 0.7 - 5);
        _.forIn(
          { tl: [-1, -1], tr: [1, -1], bl: [-1, 1], br: [1, 1] },
          ([xOff, yOff], label) => {
            ig.select(`.controls .${label}`)
              .attr('cx', xOff * pxPerRWU * d.width / 2)
              .attr('cy', yOff * pxPerRWU * d.height / 2)
              .attr('r', 5)
              .style('cursor', bestResizeCursor(xOff, yOff, d.r))
              .call(resizeable);
          });
      }
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
  chart.updateImage = function (_) {
    if (!arguments.length) return updateImage;
    updateImage = _;
    return chart;
  };
  chart.selectImage = function (_) {
    if (!arguments.length) return selectImage;
    selectImage = _;
    return chart;
  };
  return chart;
}

export default function drawMethods({ xScale, yScale, updateImage, selectImage }) {

  return {
    drawWindow: drawWindow()
      .xScale(xScale)
      .yScale(yScale),
    drawWindowGuideline: drawWindowGuideline()
      .xScale(xScale)
      .yScale(yScale),
    drawDaylightingControl: drawDaylightingControl()
      .xScale(xScale)
      .yScale(yScale),
    drawDaylightingControlGuideline: drawDaylightingControlGuideline()
      .xScale(xScale)
      .yScale(yScale),
    drawImage: drawImage()
      .xScale(xScale)
      .yScale(yScale)
      .updateImage(updateImage)
      .selectImage(selectImage),
  };
}
