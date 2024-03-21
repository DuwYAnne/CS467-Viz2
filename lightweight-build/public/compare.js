  // set the dimensions and margins of the graph
  var margin = {top: 100, right: 100, bottom: 100, left: 100},
  width = 800 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;


function drawHeatmap() {
    console.log("DRAW");
    const data = globalData?globalData:[]
    d3.selectAll('#my_dataviz svg').remove()
    d3.select("#xSelector").remove()
    d3.select("#ySelector").remove()

    var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");



    // d3.csv(ll, function(data) {

    // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    const upFunc = ()=>{
        var xValue = d3.select("#xSelector").node().value;
        var yValue = d3.select("#ySelector").node().value;
    console.log(xValue,"FSF")
    var myGroups = data.map(function(d){return d[xValue];}).sort()
    var xRange = Number(d3.max(myGroups) - d3.min(myGroups));
    var myVars = data.map(function(d){return d[yValue];}).sort()
    var yRange = Number(d3.max(myVars) - d3.min(myVars));
    const categoriesCount = 5;
    var categoriesX = [...Array(categoriesCount)].map((_, i) => {
        const upperBound = Number(d3.min(myGroups)) + (xRange / categoriesCount) * (i + 1);
        const lowerBound = Number(d3.min(myGroups)) + (xRange / categoriesCount) * i;
        console.log(upperBound, lowerBound);
        return {
            upper: upperBound,
            lower: lowerBound,
            category: i,
        };
    }); 
    var categoriesY = [...Array(categoriesCount)].map((_, i) => {
        const upperBound = Number(d3.min(myVars)) + (yRange / categoriesCount) * (i + 1);
        const lowerBound = Number(d3.min(myVars)) + (yRange / categoriesCount) * i;
        return {
            upper: upperBound,
            lower: lowerBound,
            category: i,
        };
    }); 
    function xToCategory(xValue) {
        for (let i = 0; i < categoriesCount; i++) {
            if (categoriesX[i].upper >= xValue) {
                return categoriesX[i].category;
            }
        }
    }
    function yToCategory(yValue) {
        for (let i = 0; i < categoriesCount; i++) {
            if (categoriesY[i].upper >= yValue) return categoriesY[i].category;
        }
    }

    const frequencyMap = {};
    for(let i=0;i<data.length;i++){
        const key = xToCategory(data[i][xValue]) + '#' + yToCategory(data[i][yValue]);
        frequencyMap[key] = (frequencyMap[key] || 0) + 1;
    }

    console.log(frequencyMap,"SDS")

    svg.select(".xAxis").remove();
    svg.select(".title").remove();
    svg.select(".yAxis").remove();
    svg.selectAll("rect").remove();
    svg.selectAll("g").remove();
    if(document.getElementById("tooltip"))
        document.getElementById("tooltip").remove();
    // Build X scales and axis:
    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain([0,1,2,3,4])
        .padding(0.05);
    console.log(x);
    svg.append("g")
        .style("font-size", 15)
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickValues([0,1,2,3,4]).tickFormat((i) => {
            return `${categoriesX[i].lower.toFixed(0)} - ${categoriesX[i].upper.toFixed(0)}`
        }));


    // Build Y scales and axis:
    var y = d3.scaleBand()
        .range([ height, 0 ])
        .domain([0,1,2,3,4])
        .padding(0.05);
    svg.append("g")
        .style("font-size", 15)
        .attr("class", "yAxis")
        .call(d3.axisLeft(y).tickValues([0,1,2,3,4]).tickFormat((i) => {
            return `${categoriesY[i].lower.toFixed(0)} - ${categoriesY[i].upper.toFixed(0)}`
        }));

    // Build color scale
    const frequencies = Object.values(frequencyMap);
    var myColor = d3.scaleLinear()
            .range(["blue", "maroon"])
            .domain([0,d3.max(frequencies)])

    // create a tooltip
    //   var tooltip = d3.select("#my_dataviz")
    //     .append("div")
    //     .style("opacity", 0)
    //     .attr("class", "tooltip")
    //     .style("background-color", "white")
    //     .style("border", "solid")
    //     .style("border-width", "2px")
    //     .style("border-radius", "5px")
    //     .style("padding", "5px")
    //     .style("margin-bottom","40px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
        tooltip
        .style("opacity", 1)
        d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
    }
    var mousemove = function(d) {
        tooltip
        .html("value of this cell is: " + d[yValue])
        .style("left", (d3.mouse(this)[0]+70) + "px")
        .style("top", (d3.mouse(this)[1]+150) + "px")
    }
    var mouseleave = function(d) {
        tooltip
        .style("opacity", 0)
        d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }

    // add the squares
    svg.selectAll()
        .data(data, function(d) {return d[xValue]+':'+d[yValue];})
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(xToCategory(d[xValue])) })
        .attr("y", function(d) { return y(yToCategory(d[yValue])) })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return myColor(frequencyMap[xToCategory(d[xValue])+'#'+yToCategory(d[yValue])])} )
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
    // })

    // Add title to graph
    svg.append("text")
            .attr("class","title")
            .attr("x", 0)
            .attr("y", -50)
            .attr("text-anchor", "left")
            .style("font-size", "22px")
            .text("Correlation: "+yValue+" vs "+xValue);


    // const frequencies = Object.values(frequencyMap);
    var legendScale = d3.scaleLinear()
    .range(["lightblue", "maroon"])
    .domain([0, data.length]);

    // Create legend

    var legendWidth = 150;
    var legendHeight = 30;
    var legendX = 400
    var legendY = -100;


    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + legendX + "," + legendY + ")");
        var gradientColors = ["blue", "maroon"];

        // Create linear gradient
        var gradient = svg.append("defs")
          .append("linearGradient")
          .attr("id", "gradient")
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "100%")
          .attr("y2", "0%");
        
        gradientColors.forEach(function(color, i) {
          gradient.append("stop")
            .attr("offset", (i / (gradientColors.length - 1)) * 100 + "%")
            .attr("stop-color", color);
        });
        
        // Define scale for legend values
        var legendScale = d3.scaleLinear()
          .domain([0, d3.max(frequencies)])
          .range([0, 500]);
        
        // Append rectangles for legend
        
        legend
          .append("rect")
          .attr("x", function(d) {
            return legendScale(d);
          })
          .attr("y", 40)
          .attr("width", legendWidth)
          .attr("height", 20)
          .style("fill", "url(#gradient)");
        legend
          .selectAll("text")
          .data([1,d3.max(frequencies)])
          .join("text")
          .attr("x", (d, i) => legendWidth* i)
          .attr("y", 33)
          .attr("text-anchor", "middle")
          .attr("font-size", 11)
          .style("fill", "black") // Ensure text color is visible
          .text(d => `${d}`);
        legend
            .append("text")
            .attr("dy", 28)
            .attr("x", legendWidth/2)
            .attr("font-size", 14)
            .attr("text-anchor", "middle")
            .text("Frequency");
        
    // legend.selectAll("rect")
    // .data(d3.range(legendWidth))
    // .enter().append("rect")
    // .attr("x", 0)
    // .attr("y", function(d, i) { return i * legendHeight; })
    // .attr("width", legendWidth / data.length)
    // .attr("height", legendHeight)
    // .style("fill", function(d) { return legendScale(d); });

    // // Add legend title
    // legend.append("text")
    // .attr("x", legendWidth / 2)
    // .attr("y", -5)
    // .style("text-anchor", "middle")
    // .text("Legend");

    // Add legend labels
    // var legendLabels = legend.selectAll(".legendLabel")
    // .data(legendScale.ticks(5))
    // .enter().append("text")
    // .attr("class", "legendLabel")
    // .attr("x", legendWidth + 20)
    // .attr("y", function(d, i) { return i * (legendHeight * 5); })
    // .style("text-anchor", "middle")
    // .text(function(d) { return d; });

    // Add subtitle to graph
    // svg.append("text")
    //         .attr("x", 0)
    //         .attr("y", -20)
    //         .attr("text-anchor", "left")
    //         .style("font-size", "14px")
    //         .style("fill", "grey")
    //         .style("max-width", 400)
    //         .text("Heatmap of "+yValue+" vs "+xValue);
    // }
    }




    var dropdownX = d3.select("#my_dataviz")
    .append("select")
    .attr("id", "xSelector")
    .style("width","150px")
    .style("position", "absolute")
    .style("height","40px")
    .style("left","500px")
    .style("top", "750px")
    .style("background","transparent")
    .style("text-align","center")
    .style("border-radius","10px")
    .on("change", upFunc);

    dropdownX.selectAll("option")
    .data(Object.keys(data[0]).slice(1))
    .enter().append("option")
    .text(function(d) { return d; });

    // Create a dropdown menu for y values
    var dropdownY = d3.select("#my_dataviz")
    .append("select")
    .attr("id", "ySelector")
    .style("width","150px")
    .style("position", "absolute")
    .style("height","40px")
    .style("left","50px")
    .style("top", "400px")
    .style("background","transparent")
    .style("text-align","center")
    .style("border-radius","10px")
    .on("change", upFunc);

    dropdownY.selectAll("option")
    .data(Object.keys(data[0]).slice(1))
    .enter().append("option")
    .text(function(d) { return d; });



    upFunc()
}