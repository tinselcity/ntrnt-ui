//console.log('height: ' + $("#amazingViz").height());
//console.log('width: ' + $("#amazingViz").width());

var width = $("#map #amazingViz").width(); //scope.width || 300;
var height = $("#map #amazingViz").height(); //scope.height || 1020;
var scale = 1; //scope.scale || 1;
var maxRadius = 20; //scope.maxRadius || 20;

//if(height < 100) {
//    height = 300
//}

var projection = d3.geoMercator().
    center([0, 25]).
    scale((width + 1) / 2 / Math.PI).
    translate([width / 2, height / 2]).
    precision(.1);

var svg = d3.select("#map #amazingViz").append("svg")
    .attr("width", width)
    .attr("height", height)
    ;

var g = svg.append("g");
var path = d3.geoPath().projection(projection);

// load and display the World
d3.json("data/topojson/world-110m2.json").then(function(topology) {
    g.selectAll("path")
       .data(topojson.feature(topology, topology.objects.countries).features)
       .attr("class", "feature")
       .enter().append("path")
       .attr("d", path)
       .style("fill", "#EEEEEE")
       .style("stroke", "#BDBDBD")
       .style("stroke-width", "0.5");       
});
