// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require rails-ujs
//= require turbolinks
//= require_tree .
////= require jquery
////= require jquery_ujs


function drawGraph(svgConfig, windowData, windowDataType) {
    $("#graphContainer").html('');
    $("#buttonArea").html('');

    var all_data = [
        {'name': 'Sent', 'type': 'sent', 'id': 'sentBtn', 'data': ''},
        {'name': 'Failures', 'type': 'failures', 'id': 'failuresBtn', 'data': ''},
        {'name': 'Successful', 'type': 'successful', 'id': 'successfulBtn', 'data': ''}
    ];

    d3.select('#buttonArea').selectAll('.app-button')
        .data(all_data)
        .enter().append('button')
        .attr('class', 'appButton')
        .attr('id', function (d) {
            return d.id;
        })
        .html(function (d) {
            return d.name;
        })
        .on('click', function (d) {
            drawGraph(window.svgConfig, window.data, d.type)
        });

    $('.appButton').removeClass('selected');
    $('#' + windowDataType + 'Btn').addClass('selected');

    var dataType = windowDataType;
    var chartConfig = {data: windowData};
    var graphContainerSelection = d3.select("#graphContainer");
    var svgSelection = graphContainerSelection.append("svg").attr("id", svgConfig.id)
        .attr("width", svgConfig.width)
        .attr("height", svgConfig.height);

    var xScale = d3.time.scale().range([100, svgConfig.width - 100]);
    // format the data

    if (window.hasParsedData == false) {
        chartConfig.data.forEach(function (d) {
            console.log(d.created_at);
            var parseTime = d3.time.format("%Y-%m-%d");

            d.created_at = parseTime.parse(d.created_at);
            console.log(d.created_at);

        });
        window.hasParsedData = true;
    }

    // Scale the range of the data
    xScale.domain(d3.extent(chartConfig.data, function (d) {
        return d.created_at;
    }));

    var yScale = d3.scale.linear().range([svgConfig.height - svgConfig.margin.top, svgConfig.margin.bottom])
        .domain([
            d3.min(chartConfig.data, function (d) {
                return +d[dataType];
            }),
            d3.max(chartConfig.data, function (d) {
                return +d[dataType];
            })
        ]);

    var xAxis = d3.svg.axis().scale(xScale).ticks(d3.time.days, 1)
        .tickFormat(d3.time.format('%e %b'));
    var yAxis = d3.svg.axis().orient("left").scale(yScale);

    svgSelection.append("svg:g")
        .attr("id", "xAxis")
        .call(xAxis);

    d3.select("#xAxis")
        .attr("transform", "translate(0," + (svgConfig.height - svgConfig.margin.bottom) + ")");

    svgSelection.append("svg:g").attr("id", "yAxis").call(yAxis); // apply transform logic to bring it to correct place

    d3.select("#yAxis")
        .attr("transform", "translate(" + (svgConfig.margin.left) + ",0)");

    var lineSelection = d3.svg.line()
        .x(function (d) {
            return xScale(d.created_at);
        })
        .y(function (d) {
            return yScale(d[dataType])
        });

    svgSelection.append("svg:path")
        .attr('d', lineSelection(chartConfig.data))
        .attr('stroke', '#00c8dc')
        .attr('stroke-width', 3)
        .attr('fill', 'none');

    svgSelection.append("g")
        .attr("class", "grid")
        .attr("id", "xgrid")
        .attr("transform", "translate(0," + (svgConfig.height - 20 ) + ")")
        .call(make_x_axis(xScale)
            .tickSize(-svgConfig.height, 0, 0)
            .tickFormat("")
    );

    svgSelection.append("g")
        .attr("class", "grid")
        .attr("id", "ygrid")
        .attr("transform", "translate(50,0)")
        .call(make_y_axis(yScale)
            .tickSize(-svgConfig.width, 0, 0)
            .tickFormat("")
    );

    svgSelection.selectAll("dot")
        .data(chartConfig.data)
        .enter().append("circle")
        .style("fill", "#289dcf")
        .style("stroke", "white")
        .style("stroke-width", 3)
        .attr("r", 6)
        .attr("cx", function (d) {
            return xScale(d.created_at);
        })
        .attr("cy", function (d) {
            return yScale(d[dataType]);
        });


}


function make_x_axis(xScale) {
    return d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(11)
}

function make_y_axis(yScale) {
    return d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(8)
}

function drawTable(data) {
    var tbodyOutput = '';
    data.forEach(function (d) {
        date = new Date(Date.parse(d.created_at)),
            datevalues = [
                date.getFullYear(),
                date.getMonth() + 1,
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds(),
            ];

        tbodyOutput += '<tr>\
                <td>' + datevalues[2] + '-' + datevalues[1] + '-' + datevalues[0] + '</td>\
                <td>' + d.failures + '</td>\
                <td>' + d.successful + '</td>\
                <td>' + d.sent + '</td>\
            </tr>';
    });
    $('#tableContainer table tbody').html(tbodyOutput);
}

$(document).ready(function () {

    hasParsedData = false;

    jqXHR = $.get("daily_stats");

    jqXHR.done(function (data) {
        window.data = data;
        drawGraph(window.svgConfig, data, 'sent');
        drawTable(data);
        console.log(data);
    });

    jqXHR.fail(function (data) {
        console.log(data);
    });

    svgConfig = {
        id: "graph",
        width: $('.dataTable').width(),
        height: $('.dataTable').height() - 20,
        margin: {top: 30, right: 20, bottom: 30, left: 50}
    };

    $('#tapToggleBtn').on('click', function () {
        if ($('#graphContainer').css('display') == 'none') {
            $('#tableContainer').hide();
            $('#graphContainer').show();
            $('#buttonArea').show();
        } else {
            $('#tableContainer').show();
            $('#graphContainer').hide();
            $('#buttonArea').hide();
        }
        $('#tableIcon').toggleClass('selected');
        $('#graphIcon').toggleClass('selected');
    });


});


