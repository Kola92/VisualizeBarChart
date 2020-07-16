document.addEventListener("DOMContentLoaded", function () {
  var url =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
  req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.send();
  req.onload = function () {
    json = JSON.parse(req.responseText); //Read file data

    //Sample small data set for testing
    //json = JSON.parse('{"data":[[ "1947-01-01", 243.1 ], [ "1947-04-01", 246.3 ], [ "1947-07-01", 250.1 ], [ "1947-10-01", 260.3 ], [ "1948-01-01", 266.2 ], [ "1948-04-01", 272.9 ], [ "1948-07-01", 279.5 ], [ "1948-10-01", 280.7 ], [ "1949-01-01", 275.4 ]]}');

    var dataset = json.data;

    //Convert text year data into JS Date objects so they can be plotted
    var yearData = [];
    for (var i = 0; i < dataset.length; ++i) {
      yearData.push(new Date(dataset[i][0])); //Convert "%Y-%m-%d" to date objects
    }

    //document.getElementById('graph').innerHTML=JSON.stringify(dataset[0][1]);

    const fullwidth = 1010;
    const fullheight = 600;
    const padding = 50;

    const width = fullwidth - 2 * padding;
    const height = fullheight - 2 * padding;

    //Get the range we want to display on X axis
    var maxDate = d3.max(yearData, (d) => d);
    var minDate = d3.min(yearData, (d) => d);
    var maxDateMore = new Date(maxDate);
    var minDateLess = new Date(minDate);
    maxDateMore.setMonth(maxDate.getMonth() + 3); //Adding a quarter so we have room for last bar on the graph
    minDateLess.setMonth(minDate.getMonth() - 3); //Subtracting a quarter so we have room at the beginning of the graph

    //Get the range we want to display on the Y axis
    var maxValue = d3.max(dataset, (d) => d[1]);
    var roundedUpMax = Math.ceil(maxValue / 1000) * 1000; //Round up so the graph doesn't go to the very top

    //const barSpacing = 30;
    var barPadding = 5;
    var barWidth = (width - padding) / (dataset.length + 2); //Calculate the width of each bar on the bar graph by dividing up the graph equally amongst the entries, account for the 2 extra quarters
    //Define scales
    var yScale = d3.scaleLinear().domain([0, roundedUpMax]).range([height, 0]);

    var xScale = d3
      .scaleTime()
      .domain([minDateLess, maxDateMore])
      .range([padding, width]);

    //Tests to see if we have read the dataset correctly
    //console.log(d3.min(dataset, (d) => d[0]) + " , " + d3.max(dataset, (d) => d[0]));
    //console.log(d3.min(dataset, (d) => d[1]) + " , " + d3.max(dataset, (d) => d[1]));
    //console.log(dataset.length);

    // Define the y and x axis
    var yAxis = d3.axisLeft(yScale);
    var xAxis = d3.axisBottom(xScale);

    //Create SVG
    var svg = d3
      .select("#graph")
      .append("svg")
      .attr("width", fullwidth)
      .attr("height", fullheight);

    // Draw y axis
    svg
      .append("g")
      .attr("transform", "translate(" + padding + ",0)")
      .attr("id", "y-axis")
      .call(yAxis)
      .style("font-family", "Fira Code");
    // Draw x axis
    svg
      .append("g")
      .attr("class", "xaxis")
      .attr("id", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .style("font-family", "Fira Code");
    //Add Tooltips

    var tooltip = svg
      .append("text")
      .attr("id", "tooltip")
      .attr("x", 0.3 * width - 100) //Put the info near the middle of the width of the SVG (start slightly to the left of center)
      .attr("y", height * 0.5) // Put the info at the middle of the height of the SVG
      .attr("opacity", 0.9)
      .attr("background", "yellow")
      .attr("stroke", "black");

    //Add bars for bar graph
    svg
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => xScale(yearData[i]))
      .attr("y", (d, i) => height - yScale(roundedUpMax - d[1]))
      .attr("width", (d, i) => barWidth)
      .attr("height", function (d, i) {
        if (yScale(roundedUpMax - d[1]) <= 0) {
          console.log("height: " + d[1]);
          console.log("yscale height: " + yScale(roundedUpMax - d[1])); //Check for proper scaling

          return 1;
        } else {
          return yScale(roundedUpMax - d[1]);
        }
      })
      .attr("data-date", (d, i) => d[0])
      .attr("data-gdp", (d, i) => d[1])
      .attr("fill", "LightBlue")
      .on("mouseover", function (d, i) {
        tooltip
          .text(d[0] + ": $" + d[1] + " Billions of Dollars")
          .attr("data-date", d[0])
          .attr("opacity", 0.9);
      })
      .on("mouseout", function (d) {
        tooltip.attr("opacity", 0);
      })
      //Add tooltips near mouse

      .append("title")
      .text((d, i) => d[0] + ": $" + d[1] + " Billions of Dollars")
      .attr("data-date", (d, i) => d[0]);
  };
});
