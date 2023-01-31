// -----------------------------------------------------------------------------
// api host
// -----------------------------------------------------------------------------
var g_host = "http://127.0.0.1:12346";
//! ----------------------------------------------------------------------------
//! world map
//! ----------------------------------------------------------------------------
var width = $("#map #amazingViz").width(); //scope.width || 300;
var height = $("#map #amazingViz").height(); //scope.height || 1020;
var scale = 1; //scope.scale || 1;
var maxRadius = 20; //scope.maxRadius || 20;
var projection = d3.geoMercator().
    center([0, 25]).
    scale((width + 1) / 2 / Math.PI).
    translate([width / 2, height / 2]).
    precision(.1);
var g_map_svg = d3.select("#map #amazingViz").append("svg")
    .attr("width", width)
    .attr("height", height);
var g_g = g_map_svg.append("g");
var path = d3.geoPath().projection(projection);
// load and display the World
d3.json("data/topojson/world-110m2.json").then(function(topology) {
    g_g.selectAll("path")
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
    l_body.trigger('update');
    // -----------------------------------------------------
    // sortable???
    // -----------------------------------------------------
    $(function() {
      $("#trackers_table").tablesorter({
        theme : "bootstrap",
        sortInitialOrder: "desc",
        // sort on the first column and second column in ascending order
        sortList: [[4,1]]
      })
    });
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
    // peers
    // -----------------------------------------------------
    $("#peers_table tbody tr").remove();
    var l_body = $("#peers_table").find('tbody');
    var l_peers = a_data["peers"];
    for (var i = 0; i < l_peers.length; i++) {
        var i_obj = l_peers[i];
        if (i_obj["status"] == "NONE") {
                continue;
        }
        l_body.append($('<tr>').append(
            $('<td class="col-5">').text(i_obj["host"])).append(
            $('<td class="col-3">').text(i_obj["client"])).append(
            $('<td class="col-2">').text(i_obj["from"])).append(
            $('<td class="col-3">').text(i_obj["status"])).append(
            $('<td class="col-3">').text(i_obj["recvd"])).append(
            $('<td class="col-3">').text(i_obj["recvd_per_s"])).append(
            $('<td class="col-3">').text(i_obj["sent"])).append(
            $('<td class="col-3">').text(i_obj["sent_per_s"])).append(
            $('<td class="col-2">').text(i_obj["error"])));
    }
    l_body.trigger('update');
    // -----------------------------------------------------
    // sortable???
    // -----------------------------------------------------
    $(function() {
      $("#peers_table").tablesorter({
        theme : "bootstrap",
        sortInitialOrder: "desc",
        // sort on the first column and second column in ascending order
        sortList: [[4,1]]
      })
    });
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
    // -----------------------------------------------------
    // data dict
    // -----------------------------------------------------
    var l_data_active = {
      "type": "FeatureCollection",
      "features": []
    };
    var l_data_dead = {
      "type": "FeatureCollection",
      "features": []
    };
    // -----------------------------------------------------
    // peers
    // -----------------------------------------------------
    var l_peers = a_data["peers"];
    for (var i = 0; i < l_peers.length; i++) {
        var i_obj = l_peers[i];
        if (i_obj["status"] == "NONE") {
                continue;
        }
        l_f = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [i_obj["geoip2_lon"], i_obj["geoip2_lat"]]
            }
        }
        if (i_obj["status"] == "CONNECTED") {
            l_data_active["features"].push(l_f);
        }
        else {
            l_data_dead["features"].push(l_f);
        }
    }
    // -----------------------------------------------------
    // draw dots
    // -----------------------------------------------------
    d3.selectAll("#bonkers").remove();
    var g = g_map_svg.append("g").attr("id","bonkers");
    g.selectAll('.peers_dead')
        .append("svg:circle")
        .data(l_data_dead.features)
        .enter()
        .append('path')
        .style("fill", "gray")
        .style("opacity", "0.4")
        .attr("r", 0)
        .attr('d',path)
        .attr('class', 'peers_dead');
    g.selectAll('.peers_active')
        .append("svg:circle")
        .data(l_data_active.features)
        .enter()
        .append('path')
        .style("fill", "red")
        .style("opacity", "0.9")
        .attr("r", 0)
        .attr('d',path)
        .attr('class', 'peers_active');
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
        setTimeout(refresh_view, 1000);
    }
}
//! ----------------------------------------------------------------------------
//! refresh_dashboard
//! ----------------------------------------------------------------------------
var refresh_view = function() {
    load_view();
};
//! ----------------------------------------------------------------------------
//! main
//! ----------------------------------------------------------------------------
var main = function() {
    //refresh_view();
};
//! ----------------------------------------------------------------------------
//! start
//! ----------------------------------------------------------------------------
$(document).ready(function() {
    main();
} );
//! ----------------------------------------------------------------------------
//! tab on click
//! ----------------------------------------------------------------------------
$(document).ready(function(){
  $('#myTab').click(function (link) {
    load_view();
  })
});
