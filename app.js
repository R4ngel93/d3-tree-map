/* Data */
const DATASET = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json';

/* SVG */
const svg = d3.select('svg');
const width = parseFloat(svg.attr("width"));
const height = parseFloat(svg.attr("height"));

/* Tooltip */
var tooltip = svg.append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0);

/* Margin */
const margin = { top: 0, right: 50, bottom: 0, left: 75 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

/* Color */
const fader = function (color) { return d3.interpolateRgb(color, "#fff")(0.2); }
const color = d3.scaleOrdinal(d3.schemePaired.map(fader));

/* Layout */
const treeMapLayout = d3.treemap()
  .size([innerHeight * 1.7, innerWidth * 1.7])
  .paddingInner(1)

/* Zoom stuff */
const zoomG = svg
  .attr('width', width)
  .attr('height', height)
  .append('g');

const g = zoomG.append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

svg.call(d3.zoom().on('zoom', () => {
  g.attr('transform', d3.event.transform);
}));

/* JSON data */
d3.json(DATASET).then(data => {
  //Hierarchy
  const root = d3.hierarchy(data);
  root.sum(d => d.value);
  root.sort(function (a, b) { return b.height - a.height || b.value - a.value; });
  treeMapLayout(root);

  //Rect elements
  let tile = g.selectAll('rect')
    .attr("id", function (d) { return d.data.id; })
    .attr("class", "tile")
    .data(root.descendants())
    .enter()
    .append('rect')
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr("data-name", function (d) {
      return d.data.name;
    })
    .attr("data-category", function (d) {
      return d.data.category;
    })
    .attr("data-value", function (d) {
      return d.data.value;
    })
    .attr("fill", function (d) {
      return color(d.data.category);
    })
    //Tooltip
    .on("mousemove", function (d) {
      console.log("mouseover");
      tooltip.style("opacity", .9);
      tooltip.html(
        'Name: ' + d.data.name +
        '<br>Category: ' + d.data.category +
        '<br>Value: ' + d.data.value
      )
        .attr("data-value", d.data.value)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function (d) {
      tooltip.style("opacity", 0);
    })

  //Labels
  var nodes = g.selectAll('g')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('transform', function (d) { return 'translate(' + [d.x0, d.y0] + ')' })

  nodes
    .append('text')
    .attr('class', 'tile-text')
    .selectAll("tspan")
    .data(function (d) {
      if (d.data.name === 'Video Game Sales Data Top 100' || !d.data.category) {
        return '';
      }
      return d.data.name.split(/(?=[A-Z][^A-Z])/g);
    })
    .enter().append("tspan")
    .attr("x", 4)
    .attr("y", function (d, i) { return 13 + i * 10; })
    .text(function (d) { return d; });

  /* Legend */
  let categories = root.leaves().map(nodes => nodes.data.category);
  categories = categories.filter((category, index, self) => self.indexOf(category) === index);

  const legend = d3.select('#legend');
  let legendWidth = +legend.attr("width");
  const LEGEND_OFFSET = 10;
  const LEGEND_RECT_SIZE = 15;
  const LEGEND_H_SPACING = 150;
  const LEGEND_V_SPACING = 10;
  const LEGEND_TEXT_X_OFFSET = 3;
  const LEGEND_TEXT_Y_OFFSET = -2;
  let legendElemsPerRow = Math.floor(legendWidth / LEGEND_H_SPACING);

  var legendElem = legend
    .append("g")
    .attr("transform", "translate(60," + LEGEND_OFFSET + ")")
    .selectAll("g")
    .data(categories)
    .enter().append("g")
    .attr("transform", function (d, i) {
      return 'translate(' +
        ((i % legendElemsPerRow) * LEGEND_H_SPACING) + ',' +
        ((Math.floor(i / legendElemsPerRow)) * LEGEND_RECT_SIZE + (LEGEND_V_SPACING * (Math.floor(i / legendElemsPerRow)))) + ')';
    })

  legendElem.append("rect")
    .attr('width', LEGEND_RECT_SIZE)
    .attr('height', LEGEND_RECT_SIZE)
    .attr('class', 'legend-item')
    .attr('fill', function (d) {
      return color(d);
    })

  legendElem.append("text")
    .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
    .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
    .text(function (d) { return d; });

})
