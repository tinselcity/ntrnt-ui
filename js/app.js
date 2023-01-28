// -----------------------------------------------------------------------------
// api host
// -----------------------------------------------------------------------------
var g_host = "http://127.0.0.1:12346";
//! ----------------------------------------------------------------------------
//! world map
//! ----------------------------------------------------------------------------
//console.log('height: ' + $("#amazingViz").height());
//console.log('width: ' + $("#amazingViz").width());
var width = $("#map #amazingViz").width(); //scope.width || 300;
var height = $("#map #amazingViz").height(); //scope.height || 1020;
var scale = 1; //scope.scale || 1;
var maxRadius = 20; //scope.maxRadius || 20;
var projection = d3.geoMercator().
    center([0, 25]).
    scale((width + 1) / 2 / Math.PI).
    translate([width / 2, height / 2]).
    precision(.1);
var svg = d3.select("#map #amazingViz").append("svg")
    .attr("width", width)
    .attr("height", height);
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
//! ----------------------------------------------------------------------------
//! show_info
//! ----------------------------------------------------------------------------
var show_info = function(a_data)
{
    $("#info_hash").val(a_data["info_hash"]);
    $("#info_name").val(a_data["info_name"]);
    $("#info_created_by").val(a_data["created_by"]);
    $("#info_creation_date").val(a_data["creation_date"]);
    $("#info_encoding").val(a_data["encoding"]);
    $("#info_comment").val(a_data["comment"]);
    $("#info_length").val(a_data["length"]);
    $("#info_num_pieces").val(a_data["num_pieces"]);
    $("#info_pieces_length").val(a_data["pieces_length"]);
}
//! ----------------------------------------------------------------------------
//! load_info
//! ----------------------------------------------------------------------------
var load_info = function() {
    l_url = g_host+"/api/v0.1/info.json";
    $.get(l_url, function(data) {
        show_info(data);
    }, "json");
}
//! ----------------------------------------------------------------------------
//! show_trackers
//! ----------------------------------------------------------------------------
var show_trackers = function(a_data)
{
    // -----------------------------------------------------
    // trackers
    // -----------------------------------------------------
    $("#trackers_table tbody tr").remove();
    var l_body = $("#trackers_table").find('tbody');
    var l_trackers = a_data["trackers"];
    for (var i = 0; i < l_trackers.length; i++) {
        var i_obj = l_trackers[i];
        if ((i_obj["announce_num"] == 0) &&
            (i_obj["scrape_num"] == 0)) {
                continue;
        }
        l_body.append($('<tr>').append(
            $('<td class="col-3">').text(i_obj["host"])).append(
            $('<td>').text(i_obj["scrape_num_complete"])).append(
            $('<td>').text(i_obj["scrape_num_downloaded"])).append(
            $('<td>').text(i_obj["scrape_num_incomplete"])).append(
            $('<td>').text(i_obj["announce_num"])).append(
            $('<td>').text(i_obj["announce_last_s"])).append(
            $('<td>').text(i_obj["announce_next_s"])).append(
            $('<td>').text(i_obj["announce_num_peers"])).append(
            $('<td>').text(i_obj["scrape_num"])).append(
            $('<td>').text(i_obj["scrape_last_s"])).append(
            $('<td>').text(i_obj["scrape_next_s"])));
    }
    // -----------------------------------------------------
    // sortable???
    // -----------------------------------------------------
/*
    $(function() {
      $("table").tablesorter({
        theme : "bootstrap",
        sortInitialOrder: "desc",
        // sort on the first column and second column in ascending order
        sortList: [[1,1]],
        widgets : [ "columns", "zebra" ],
        widgetOptions : {
          zebra : ["even", "odd"],
          columns: [ "primary", "secondary", "tertiary" ],
        }
      })
    });
*/
}
//! ----------------------------------------------------------------------------
//! load_trackers
//! ----------------------------------------------------------------------------
var load_trackers = function() {
    l_url = g_host+"/api/v0.1/trackers.json";
    $.get(l_url, function(data) {
        show_trackers(data);
    }, "json");
}
//! ----------------------------------------------------------------------------
//! show_peers
//! ----------------------------------------------------------------------------
var show_peers = function(a_data)
{
    // -----------------------------------------------------
    // trackers
    // -----------------------------------------------------
    $("#peers_table tbody tr").remove();
    var l_body = $("#peers_table").find('tbody');
    var l_peers = a_data["peers"];
    for (var i = 0; i < l_peers.length; i++) {
        var i_obj = l_peers[i];
        if (i_obj["status"] == "NONE") {
                continue;
        }
        if (i_obj["status"] == "DEAD") {
                continue;
        }
        if (!i_obj["host"]) {
                continue;
        }
        l_body.append($('<tr>').append(
            $('<td class="col-6">').text(i_obj["host"])).append(
            $('<td class="col-3">').text(i_obj["status"])).append(
            $('<td class="col-2">').text(i_obj["from"])).append(
            $('<td class="col-5">').text(i_obj["geoip2_country"])).append(
            $('<td class="col-3">').text(i_obj["geoip2_city"])));
    }
    // -----------------------------------------------------
    // sortable???
    // -----------------------------------------------------
/*
    $(function() {
      $("table").tablesorter({
        theme : "bootstrap",
        sortInitialOrder: "desc",
        // sort on the first column and second column in ascending order
        sortList: [[1,1]],
        widgets : [ "columns", "zebra" ],
        widgetOptions : {
          zebra : ["even", "odd"],
          columns: [ "primary", "secondary", "tertiary" ],
        }
      })
    });
*/
}
//! ----------------------------------------------------------------------------
//! load_peers
//! ----------------------------------------------------------------------------
var load_peers = function() {
    l_url = g_host+"/api/v0.1/peers.json";
    $.get(l_url, function(data) {
        show_peers(data);
    }, "json");
}
//! ----------------------------------------------------------------------------
//! show_peers
//! ----------------------------------------------------------------------------
var show_map = function(a_data)
{
    d3.selectAll("#bonkers").remove();
    var g = g_map_svg.append("g").attr("id","bonkers");
    if (a_data) {
        var radius = a_data[0].count;
        var elem = g.selectAll("g").data(a_data);
        var elemEnter = elem.enter()
            .append("g")
            .attr("transform", function(d) {
                var coord = projection(d.coordinates);
                return "translate("+ coord.join(",")+")";

            });
        elemEnter
            .append("svg:circle")
            .attr("r", 0)
            .style("fill", function(d) {
                var l_scaled_amount = (d.count / a_total);
                var l_color = 255 - Math.round(l_scaled_amount*500.0*255);
                return "rgb("
                + "255" + ","
                + l_color + ","
                + l_color + ")";
            })
            .style("stroke", "rgba(200, 50, 50, 0.75)")
            .style("fill-opacity", "0.30")
            .on('mousedown', function(d) {
                add_filter('virt_remote_host', d.src_ip);
            })
            .on("mouseover", function(d) {
                d3.select(this)
                .attr("r", function(d) {
                    return get_radius(d.count, a_total, 1.5)
                })
                .style("fill-opacity", "0.60")
                .style("stroke", "rgba(60, 70, 60, 10.0)")
                ;
                tooltip
                    .style("visibility", "visible")
                    .html(
                        "<b>" +
                        d.src_ip.toUpperCase() +
                        "</b>" +
                        ": " + Math.round((d.count)) + " Alerts: " +
                        (100.0*(d.count / a_total)).toFixed(2) + "%"
                        );
            })
            .on("mouseout", function(d) {
                    d3.select(this)
                    .attr("r", function(d) {
                        return get_radius(d.count, a_total, 1.0)
                    })
                    .style("stroke", "rgba(200, 50, 50, 0.75)")
                    .style("fill-opacity", "0.30")
                    ;
                tooltip
                    .style("visibility", "hidden");
            })
            .transition()
            .duration(1000)
            .delay(function(d, i) {return i * 10;})
            .attr("r", function(d) {
                return get_radius(d.count, a_total, 1.0)
            });
    }
    resizeMap();
}
//! ----------------------------------------------------------------------------
//! load_map
//! ----------------------------------------------------------------------------
var load_map = function() {
    l_url = g_host+"/api/v0.1/peers.json";
    $.get(l_url, function(data) {
        show_map(data);
    }, "json");
}
//! ----------------------------------------------------------------------------
//! load view
//! ----------------------------------------------------------------------------
var load_view = function() {
    var l_tab_id = $('#myTab .active').attr('id');
    if (l_tab_id == "info-tab") {
        load_info();
    }
    else if(l_tab_id == "trackers-tab") {
        load_trackers();
    }
    else if(l_tab_id == "peers-tab") {
        load_peers();
    }
    else if(l_tab_id == "map-tab") {
        load_map();
    }
}
//! ----------------------------------------------------------------------------
//! refresh_dashboard
//! ----------------------------------------------------------------------------
var refresh_view = function() {
    load_view();
    setTimeout(refresh_view, 1000);
};
//! ----------------------------------------------------------------------------
//! main
//! ----------------------------------------------------------------------------
var main = function() {
    refresh_view();
};
//! ----------------------------------------------------------------------------
//! start
//! ----------------------------------------------------------------------------
$(document).ready(function() {
    main();
} );
