margin_scatter = {
    top: 20,
    right: 20,
    bottom: 40,
    left: 40
    },
    width_scatter = 800 - margin_scatter.left - margin_scatter.right,
    height_scatter = 631,92 - margin_scatter.top - margin_scatter.bottom,
  
    x_scatter = d3.scaleLinear().range([0, width_scatter]),
    y_scatter = d3.scaleLinear().range([height_scatter, 0]),
  
    xAxis_scatter = d3.axisBottom(x_scatter),
    yAxis_scatter = d3.axisLeft(y_scatter);
  
svg = d3.select("#scatterArea").append("svg")
    .attr("width", width_scatter + margin_scatter.left + margin_scatter.right)
    .attr("height", height_scatter + margin_scatter.top + margin_scatter.bottom)
    .attr("transform", "translate(" + 20 + "," + 0 + ")")
    
focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin_scatter.left + "," + margin_scatter.top + ")");
  
xAxis = focus.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height_scatter + ")")
    .call(xAxis_scatter);
  
yAxis = focus.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis_scatter);
  
focus.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin_scatter.left)
    .attr("x", 0 - (height_scatter / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Y1");
  
svg.append("text")
    .attr("transform",
        "translate(" + ((width_scatter + margin_scatter.right + margin_scatter.left) / 2) + " ," +
        (height_scatter + margin_scatter.top + margin_scatter.bottom) + ")")
    .style("text-anchor", "middle")
    .text("Y2");
  
  
function drawScatter(data) {
    cValue = function (d) {
      return d.Continent;
    }
  
    color = d3.scaleOrdinal(d3.schemeCategory10);
        //Update the scale
    var maxHeight = d3.max(data, function (d) {
        return Math.abs(d.Y2)
    });
    var minHeight = d3.min(data, function (d) {
        return Math.abs(d.Y2)
    })

    y_scatter.domain([maxHeight + 0.5, -maxHeight - 0.5]); //show negative
    var maxWidth = d3.max(data, function (d) {
        return Math.abs(d.Y1)
    });
    var minWidth = d3.min(data, function (d) {
        return Math.abs(d.Y1)
    })

    x_scatter.domain([maxWidth + 0.5, -maxWidth - 4]); //show negative
    xAxis_scatter.scale(x_scatter);
    xAxis.transition().call(xAxis_scatter);
    yAxis_scatter.scale(y_scatter);
    yAxis.transition().call(yAxis_scatter);
    
    focus.selectAll("circle").remove();
    
    dots = focus.selectAll("circle").data(data);
  
    dots.enter().append("circle")
        .attr("r", 3)
        .attr("class", "knncircle")
        .style("fill", function (d) {
            return color(cValue(d));
        })
        .attr("cx", function (d) {
            return x_scatter(d.Y1);
        })
        .attr("cy", function (d) {
            return y_scatter(d.Y2)
        })
        
    var legend = focus.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
           return "translate(0," + i * 17 + ")";
        });
  
    legend.append("rect")
        .attr("x", width_scatter - 5)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", color)
        
    legend.append("text")
        .attr("x", width_scatter - 15)
        .attr("y", 6)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .style("font-size", "0.8em")
        .text(function (d) {
            return d;
        })
        .on('click', function(d){
        var currentContinent = d
        update(currentContinent, fullDataSet)
        })
}

function update(currentContinent, dataset) {
    var dataFilter = dataset.filter(function(d){
        return d.Continent==currentContinent})
    //updateTableData(dataFilter)
    drawScatter(dataFilter)
}
  
    //brush to scatterplot  
  brushTot = d3.brush()
    .extent([
        [0, 0],
        [width_scatter, height_scatter]
    ])
    .on("end", selected)
  
  focus.append("g")
    .attr("class", "brushT")
    .call(brushTot);
  
//handling of selected plots  
  function selected() {
    dataSelection = []
    var selection = d3.event.selection;
    if (selection != null) {
        focus.selectAll("circle")
            .style("fill", function (d) {
                if (x_scatter(d.Y1) > selection[0][0] && x_scatter(d.Y1) < selection[1][0] &&
                    y_scatter(d.Y2) > selection[0][1] && y_scatter(d.Y2) < selection[1][1]) {
                    dataSelection.push(d);
                    return "green";
                    
                } else {
                    return "red";
                }
            })
            focus.selectAll(".legend").remove();
            updateGraph(dataSelection);
        }else {
            //No data selected
            focus.selectAll("circle")
                .style("fill", function (d) {
                    return color(cValue(d));
                })
            updateGraph(fullDataSet);
            drawScatter(fullDataSet);
      }
  }

function drawGraph(){
    d3.select('#chart').selectAll("svg").remove();
    data = graphDataAllYears
    var width = 1000;
    var height = 800;
    var margin = 50;
    var duration = 250;

    var lineOpacity = "0.25";
    var lineOpacityHover = "0.85";
    var otherLinesOpacityHover = "0.1";
    var lineStroke = "1.5px";
    var lineStrokeHover = "2.5px";

    var circleOpacity = '0.85';
    var circleOpacityOnLineHover = "0.25"
    var circleRadius = 3;
    var circleRadiusHover = 6;


    /* Format Data */
    var parseDate = d3.timeParse("%Y");
    data.forEach(function(d) { 
      d.values.forEach(function(d) {
        d.TIME = parseDate(d.TIME);
        console.log(d.TIME)
        d.USD_CAP = +d.USD_CAP;    
        });
    });


    /* Scale */
    var xScale = d3.scaleTime()
        .domain(d3.extent(data[0].values, d => d.TIME))
        .range([0, width-margin]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data[0].values, d => d.USD_CAP)])
        .range([height-margin, 0]);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = d3.select("#chart").append("svg")
        .attr("width", (width+margin)+"px")
        .attr("height", (height+margin)+"px")
        .append('g')
        .attr("transform", `translate(${margin}, ${margin})`);

    var line = d3.line()
        .x(d => xScale(d.TIME))
        .y(d => yScale(d.USD_CAP));

    let lines = svg.append('g')
        .attr('class', 'lines');

    lines.selectAll('.line-group')
        .data(data).enter()
        .append('g')
        .attr('class', 'line-group')  
        .on("mouseover", function(d, i) {
    svg.append("text")
        .attr("class", "title-text")
        .style("fill", color(i))        
        .text(d.name)
        .attr("text-anchor", "middle")
        .attr("x", (width-margin)/2)
        .attr("y", 5);
    })
      .on("mouseout", function(d) {
    svg.select(".title-text").remove();
    })
        .append('path')
        .attr('class', 'line')  
        .attr('d', d => line(d.values))
        .style('stroke', (d, i) => color(i))
        .style('opacity', lineOpacity)
        .on("mouseover", function(d) {
      d3.selectAll('.line')
					.style('opacity', otherLinesOpacityHover);
      d3.selectAll('.circle')
					.style('opacity', circleOpacityOnLineHover);
      d3.select(this)
        .style('opacity', lineOpacityHover)
        .style("stroke-width", lineStrokeHover)
        .style("cursor", "pointer");
    })
  .on("mouseout", function(d) {
      d3.selectAll(".line")
					.style('opacity', lineOpacity);
      d3.selectAll('.circle')
					.style('opacity', circleOpacity);
      d3.select(this)
        .style("stroke-width", lineStroke)
        .style("cursor", "none");
    });


/* Add circles in the line */
lines.selectAll("circle-group")
  .data(data).enter()
  .append("g")
  .style("fill", (d, i) => color(i))
  .selectAll("circle")
  .data(d => d.values).enter()
  .append("g")
  .attr("class", "circle")  
  .on("mouseover", function(d) {
    d3.select(this)     
        .style("cursor", "pointer")
        .append("text")
        .attr("class", "text")
        .text(`${d.USD_CAP}`)
        .attr("x", d => xScale(d.TIME) + 5)
        .attr("y", d => yScale(d.USD_CAP) - 10);
    })
  .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")  
        .transition()
        .duration(duration)
        .selectAll(".text").remove();
    })
  .append("circle")
  .attr("cx", d => xScale(d.TIME))
  .attr("cy", d => yScale(d.USD_CAP))
  .attr("r", circleRadius)
  .style('opacity', circleOpacity)
  .on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(duration)
          .attr("r", circleRadiusHover);
      })
    .on("mouseout", function(d) {
        d3.select(this) 
          .transition()
          .duration(duration)
          .attr("r", circleRadius);  
      });

/* Add Axis into SVG */
var xAxis = d3.axisBottom(xScale).ticks(5);
var yAxis = d3.axisLeft(yScale).ticks(5);

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${height-margin})`)
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append('text')
  .attr("y", 15)
  .attr("transform", "rotate(-90)")
  .attr("fill", "#000")
  .text("Total values");
    
}

function redraw (start) {
    d3.select(this).selectAll("tr")
        .style("display", function(d,i) {
            return i >= start && i < start + 16 ? null : "none";
    })
}

var dataAllYears;
var graphDataAllYears = [];

function getGraphDataAllYears(json,filteredData){
    dataAllYears = json;
    var countrysSelected = [];
    graphDataAllYears.length = 0
    if(filteredData.length>0){
        let limit = filteredData.length;
        for(i=0; i<limit; i++){
            let country = filteredData[i].LOCATION;
            countrysSelected.push(country);
            let x = {};
            x['name'] = country;
            x['values'] = []
            graphDataAllYears.push(x)
        }
    }
    for(i=0;i<dataAllYears.length;i++){
        dataInstance = dataAllYears[i]
        let country = dataInstance['LOCATION']
        if(countrysSelected.includes(country)){
            for(i=0;i<graphDataAllYears.length;i++){
                if(graphDataAllYears[i].name === country){
                    delete dataInstance['LOCATION']
                    graphDataAllYears[i]['values'].push(dataInstance)
                }
            }
        }
        }
    drawGraph();
}

function updateGraph(data){
    var filteredData = data;
    d3.json("./data/dataAllYears.json", function(error,json){
        if(error){
            console.log(error);
        }
        getGraphDataAllYears(json,filteredData)
    });
}

d3.json("./data/fullDataSet.json", function(data){
    fullDataSet = data;
    updateGraph(fullDataSet);
    drawScatter(fullDataSet);
})  