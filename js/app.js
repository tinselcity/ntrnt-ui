// -----------------------------------------------------------------------------
// api host
// -----------------------------------------------------------------------------
var g_host = "http://127.0.0.1:12346";
//! ----------------------------------------------------------------------------
//! world map
//! ----------------------------------------------------------------------------
var g_width = $("#map #amazingViz").width();
var g_height = $("#map #amazingViz").height();
var g_projection = d3.geoMercator()
    .center([0, 25])
    .scale((g_width + 1) / 2 / Math.PI)
    .translate([g_width / 2, g_height / 2])
    .precision(.1);
var g_map_svg = d3.select("#map #amazingViz").append("svg")
    .attr("width", g_width)
    .attr("height", g_height);
var g_g = g_map_svg.append("g");
var g_path = d3.geoPath().projection(g_projection);
// ---------------------------------------------------------
// load and display the World
// ---------------------------------------------------------
d3.json("data/topojson/world-110m2.json").then(function(topology) {
    g_g.selectAll("path")
        .data(topojson.feature(topology, topology.objects.countries).features)
        .attr("class", "feature")
        .enter().append("path")
        .attr("d", g_path)
        .style("fill", "#EEEEEE")
        .style("stroke", "#BDBDBD")
        .style("stroke-width", "0.5");
});
//! ----------------------------------------------------------------------------
//! ****************************************************************************
//!                      Z O O M   A N D   P A N
//! ****************************************************************************
//! ----------------------------------------------------------------------------
/*
var g_translate = [0,0];
var g_scale = 1;
var zoom = d3.zoom()
    .on("zoom",function() {
        g_translate = d3.event.translate;
        g_scale = d3.event.scale;
        g_g.attr("transform","translate("+ g_translate.join(",")+")scale("+g_scale+")");
        d3.selectAll("#bonkers").attr("transform","translate("+ g_translate.join(",")+")scale("+g_scale+")");
});
*/
//! ----------------------------------------------------------------------------
//! TODO
//! ----------------------------------------------------------------------------
/*
g_map_svg.call(zoom);
*/
//! ----------------------------------------------------------------------------
//! TODO
//! ----------------------------------------------------------------------------
/*
function zoomClick() {
    var clicked = d3.event.target,
        direction = 1,
        factor = 0.4,
        target_zoom = 1,
        center = [width / 2, height / 2],
        extent = zoom.scaleExtent(),
        translate = zoom.translate(),
        translate0 = [],
        l = [],
        view = {x: translate[0], y: translate[1], k: zoom.scale()};
    d3.event.preventDefault();
    direction = (this.id === 'zoom_in') ? 1 : -1;
    target_zoom = zoom.scale() * (1 + factor * direction);
    if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }
    translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
    view.k = target_zoom;
    l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];
    view.x += center[0] - l[0];
    view.y += center[1] - l[1];
    interpolateZoom([view.x, view.y], view.k);
}
*/
//! ----------------------------------------------------------------------------
//! TODO
//! ----------------------------------------------------------------------------
/*
function zoomed() {
    g_g.attr("transform",
        "translate(" + zoom.translate() + ")" +
        "scale(" + zoom.scale() + ")"
    );
    d3.selectAll("#bonkers").attr("transform","translate("+
        zoom.translate().join(",")+")scale("+zoom.scale()+")");
}
*/
//! ----------------------------------------------------------------------------
//! TODO
//! ----------------------------------------------------------------------------
/*
function interpolateZoom (translate, scale) {   
    var self = this;
    return d3.transition().duration(350).tween("zoom", function () {
        var iTranslate = d3.interpolate(zoom.translate(), translate),
            iScale = d3.interpolate(zoom.scale(), scale);
        return function (t) {
            zoom
                .scale(iScale(t))
                .translate(iTranslate(t));
            zoomed();
        };
    });
}
// don't zoom on scroll
d3.selectAll('.zoom-btn').on('click', zoomClick);
g_map_svg.on("wheel.zoom", null);
*/
//! ----------------------------------------------------------------------------
//! show_peers
//! ----------------------------------------------------------------------------
var show_map = function(a_data)
{
    // -----------------------------------------------------
    // vars
    // -----------------------------------------------------
    var l_data_active = [];
    var l_data_none = [];
    var l_max = 1000;
    var l_count_active = 0;
    var l_count_none = 0;
    // -----------------------------------------------------
    // peers
    // -----------------------------------------------------
    var l_peers = a_data["peers"];
    for (var i = 0; i < l_peers.length; i++) {
        var i_obj = l_peers[i];
        if ((i_obj["status"] == "CONNECTED") &&
            (l_count_active < l_max))  {
            l_data_active.push(i_obj)
            ++l_count_active;
        }
        else if ((i_obj["status"] != "CONNECTED") &&
                 (l_count_none < l_max)){
            l_data_none.push(i_obj)
            ++l_count_none;
        }
    }
    // -----------------------------------------------------
    // clean last
    // -----------------------------------------------------
    d3.selectAll("#peers_map").remove();
    var g_peers = g_map_svg.append("g").attr("id","peers_map");
    // -----------------------------------------------------
    //
    // -----------------------------------------------------
    // create a tooltip
    var l_tooltip = d3.select("#map #amazingViz")
      .append("div")
      .attr("class", "tooltip fw-bold mt-5")
      .style("visibility", "hidden")
      .style("background-color", "silver")
      .style("opacity", 0.8)
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "5px");

    var mouseover_inactive = function(event, d) {
        l_tooltip
            .style("visibility", "visible")
            .style("background-color", "#92A8D1")
            .style("top", (event.pageY)+"px")
            .style("left",(event.pageX)+"px")
            .html("<p>"+d.host+"</p>"+"<p>"+d.geoip2_city+", "+d.geoip2_country+"</p>");
        d3.select(this)
            .attr("r", 10)
            .style("fill", "#92A8D1")
            .style("fill-opacity", "0.7");
    }
    var mouseover_active = function(event, d) {
        l_tooltip
            .style("visibility", "visible")
            .style("background-color", "#F7CAC9")
            .style("top", (event.pageY)+"px")
            .style("left",(event.pageX)+"px")
            .html("<p>"+d.client+"</p>"+"<p>"+d.host+"</p>"+"<p>"+d.geoip2_city+", "+d.geoip2_country+"</p>");
        d3.select(this)
            .attr("r", 10)
            .style("fill", "#F7CAC9")
            .style("fill-opacity", "0.7");
    }
    var mouseleave = function(d) {
        l_tooltip
            .style("visibility", "hidden")
        d3.select(this)
            .attr("r", 5)
            .style("fill", "gray")
            .style("fill-opacity", "0.5");
    }
    // -----------------------------------------------------
    // draw peers inactive
    // -----------------------------------------------------
    g_peers.selectAll("peers_none")
        .data(l_data_none)
        .enter()
        .append("circle")
        .attr("cx",function(d) {
            return g_projection([
                d.geoip2_lon,
                d.geoip2_lat
            ])[0];
        })
        .attr("cy",function(d) {
            return g_projection([
                d.geoip2_lon,
                d.geoip2_lat
            ])[1];
        })
        .style("fill", "gray")
        .style("fill-opacity", "0.5")
        .style("opacity", "0.4")
        .style("stroke", "#888888")
        .style("stroke-width", "0.5")
        .attr("r",5)
        .on("mouseover", mouseover_inactive)
        .on("mouseleave", mouseleave);
    // -----------------------------------------------------
    // draw peers active
    // -----------------------------------------------------
    g_peers.selectAll("peers_active")
        .data(l_data_active)
        .enter()
        .append("circle")
        .attr("cx",function(d) {
            return g_projection([
                d.geoip2_lon,
                d.geoip2_lat
            ])[0];
        })
        .attr("cy",function(d) {
            return g_projection([
                d.geoip2_lon,
                d.geoip2_lat
            ])[1];
        })
        .style("fill", "red")
        .style("fill-opacity", "0.7")
        .style("opacity", "0.7")
        .style("stroke", "#888888")
        .style("stroke-width", "0.5")
        .attr("r",5)
        .on("mouseover", mouseover_active)
        .on("mouseleave", mouseleave);
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
            $('<td>').text(i_obj["host"])).append(
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
        // -------------------------------------------------
        // create state string
        // -------------------------------------------------
        l_state = "";
        l_body.append($('<tr>').append(
            $('<td>').text(i_obj["host"])).append(
            $('<td>').text(i_obj["client"])).append(
            $('<td>').text(i_obj["from"])).append(
            $('<td>').text(i_obj["status"])).append(
            $('<td>').text(i_obj["peer_choking"])).append(
            $('<td class="text-end">').text(i_obj["recvd"])).append(
            $('<td class="text-end">').text(i_obj["recvd_per_s"])).append(
            $('<td class="text-end">').text(i_obj["sent"])).append(
            $('<td class="text-end">').text(i_obj["sent_per_s"])).append(
            $('<td class="text-end">').text(i_obj["error"])));
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
        //setTimeout(refresh_view, 1000);
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
