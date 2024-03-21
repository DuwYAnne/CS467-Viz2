const svg = d3.select("#svg");
const { width, height } = document
  .getElementById("svg")
  .getBoundingClientRect();

const mood = {
  1: 'very negative',
  2: 'slightly negative',
  3: 'neutral',
  4: 'slightly positive',
  5: 'very positive'
}
var type = 0; // 0: mood, 1: sleepminutes, 2: activeminutes, 4: etc.
function tooltip(d) {
  const formatDate = d3.timeFormat("%B %d, %Y");
  switch (type) {
    case 0:
      return `You had a ${mood[d.value]} mood on ${formatDate(d.date)}}`
    case 1:
      return `${formatDate(d.date)}: ${d.value.toFixed(0)} minutes of sleep`
    case 2:
      return `${formatDate(d.date)}: ${d.value.toFixed(0)} minutes of activity`
    default:
      return "something went wrong"
  }
}
function drawCalendar() {
  var dateValues;
  switch (type) {
    case 0:
      dateValues = globalData.map(dv => ({
        date: d3.utcDay(new Date(dv.Date)),
        value: Number(dv.Mood)
      }));
      break;
    case 1:
      dateValues = globalData.map(dv => ({
        date: d3.utcDay(new Date(dv.Date)),
        value: Number(dv.SleepMinutes)
      }));
      break;
    case 2:
      dateValues = globalData.map(dv => ({
        date: d3.utcDay(new Date(dv.Date)),
        value: Number(dv.ActiveMinutes),
        
      }));
      break;
    default:
      console.log("uhhhh");

  }
  console.log(dateValues)

  const categorical = type == 0;
  const years = Array.from(
    d3.group(dateValues, d => d.date.getUTCFullYear()),
    ([key, values]) => ({ key, values })
  ).reverse();
  const values = dateValues.map(c => c.value);
  const maxValue = d3.max(values);
  const minValue = d3.min(values);
  const valueRange = maxValue - minValue;

  const cellSize = 17;
  const yearHeight = cellSize * 7;

  var group = svg.select("g");
  // If the <g> element doesn't exist yet, append it
  if (group.empty()) {
      group = svg.append("g");
  }

  const year = group
    .selectAll("g")
    .data(years)
    .join("g")
    .attr(
      "transform",
      (d, i) => `translate(50, ${yearHeight * i + cellSize * 1})`
    );
  year
    .append("text")
    .attr("x", -40)
    .attr("y", -35)
    .attr("text-anchor", "end")
    .attr("font-size", 16)
    .attr("font-weight", 550)
    .attr("transform", "rotate(270)")
    .text(d => d.key);

  const formatDay = d =>
    ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.getUTCDay()];
  const countDay = d => d.getUTCDay();
  const timeWeek = d3.utcSunday;
  var colorFn = d3
    .scaleSequential(d3.interpolatePlasma)
    .domain([Math.floor(minValue), Math.ceil(maxValue)]);
  if (categorical) {
    colorFn = d3.scaleQuantize()
      .domain([1, 5])
      .range(d3.range(5).map(function(d) {
        return d3.interpolatePlasma(d / (5 - 1));
      }));
  }
  year
    .append("g")
    .attr("text-anchor", "end")
    .selectAll("text")
    .data(d3.range(7).map(i => new Date(1995, 0, i)))
    .join("text")
    .attr("x", -5)
    .attr("y", d => (countDay(d) + 0.5) * cellSize)
    .attr("dy", "0.31em")
    .attr("font-size", 15)
    .text(formatDay);
  year
    .append("g")
    .selectAll("rect")
    .data(d => d.values)
    .join("rect")
    .attr("width", cellSize - 1.5)
    .attr("height", cellSize - 1.5)
    .attr(
      "x",
      (d, i) => timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 10
    )
    .attr("y", d => countDay(d.date) * cellSize + 0.5)
    .attr("fill", d => colorFn(d.value))
    .on("mouseover", (event, d) => {
      // Get mouse position
      const [x, y] = d3.pointer(event);
      console.log(x, y);
      // Show tooltip
      d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("left", `${x + 35}px`)
          .style("top", `${y + 90}px`)
          .html(`${tooltip(d)}`);
      })
      .on("mouseout", () => {
          // Hide tooltip on mouseout
          d3.select(".tooltip").remove();
      });

  const legend = group
    .append("g")
    .attr(
      "transform",
      `translate(10, ${years.length * yearHeight + cellSize * 4})`
    );

  const categoriesCount = 5;
  var categories = [...Array(categoriesCount)].map((_, i) => {
    const upperBound = minValue + (valueRange / categoriesCount) * (i + 1);
    const lowerBound = minValue + (valueRange / categoriesCount) * i;
    return {
        upperBound,
        lowerBound,
        color: colorFn((upperBound + lowerBound) / 2),
        selected: true
    };
  }); 

  if (categorical) {
    categories = [{upperBound: 1, lowerBound: 0, color: colorFn(1), selected: true}, 
                  {upperBound: 2, lowerBound: 1, color: colorFn(2), selected: true}, 
                  {upperBound: 3, lowerBound: 2, color: colorFn(3), selected: true}, 
                  {upperBound: 4, lowerBound: 3, color: colorFn(4), selected: true}, 
                  {upperBound: 5, lowerBound: 4, color: colorFn(5), selected: true}];
  }

  const legendWidth = 60;
  const legendOffset = 500;
  function toggle(legend) {
    const { lowerBound, upperBound, selected } = legend.explicitOriginalTarget.__data__;
    console.log(legend);
    console.log(lowerBound, upperBound, selected);

    legend.explicitOriginalTarget.__data__.selected = !selected;

    const highlightedDates = years.map(y => ({
      key: y.key,
      values: y.values.filter(
      v => v.value > lowerBound && v.value <= upperBound
      )
    }));

    year
      .data(highlightedDates)
      .selectAll("rect")
      .data(d => d.values, d => d.date)
      .transition()
      .duration(500)
      .attr("fill", d => (legend.explicitOriginalTarget.__data__.selected ? colorFn(d.value) : "white"));
  }

  console.log(categories);
  if (categorical) {
  legend
    .selectAll("rect")
    .data(categories)
    .enter()
    .append("rect")
    .attr("fill", d => d.color)
    .attr("x", (d, i) => legendWidth * i + legendOffset)
    .attr("width", legendWidth)
    .attr("height", 15)
    .on("click", toggle);

    legend
    .selectAll("text")
    .data(categories)
    .join("text")
    .attr("x", (d, i) => legendWidth * i + legendWidth/2 + legendOffset)
    .attr("y", -5)
    .attr("text-anchor", "middle")
    .attr("font-size", 11)
    .text(d => `${d.upperBound}`);
  } else {
    legend
      .selectAll("rect")
      .data(categories)
      .enter()
      .append("rect")
      .attr("fill", d => d.color)
      .attr("x", (d, i) => legendWidth * i + legendOffset)
      .attr("width", legendWidth)
      .attr("height", 15)
      .on("click", toggle);

    legend
      .selectAll("text")
      .data(categories)
      .join("text")
      .attr("x", (d, i) => legendWidth * i + legendWidth/2 + legendOffset)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .text(d => `${d.lowerBound.toFixed(0)} - ${d.upperBound.toFixed(0)}`);
    

    legend
      .append("text")
      .attr("dy", 28)
      .attr("x", legendOffset)
      .attr("font-size", 14)
      .text("Click on category to select/deselect days");
  }

}




document.getElementById('uploadForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the form from submitting
  const fileInput = document.getElementById('myfile');
  const file = fileInput.files[0]; // Get the uploaded file
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const contents = e.target.result; // Get the contents of the file
      processData(contents); // Call a function to process the data
    };

    reader.readAsText(file); // Read the file as text
  }
});

function processData(contents) {
  // Here you can parse and process the contents of the file
  // For example, you can split it by lines
  console.log("Process");

  // Assign the parsed data to the global variable
  globalData = d3.csvParse(contents);
  changeButton();
  drawCalendar();
}


document.addEventListener("DOMContentLoaded", function() {
  // Get references to the arrow buttons
  const leftArrow = document.querySelector('.arrow-left');
  const rightArrow = document.querySelector('.arrow-right');

  // Add click event listeners to the arrow buttons
  leftArrow.addEventListener('click', function() {
    // Action to perform when left arrow button is clicked
    console.log('Left arrow button clicked');
    // Add your custom logic here
    type = (type + 2) % 3;
    changeButton();
    drawCalendar();
  });

  rightArrow.addEventListener('click', function() {
    // Action to perform when right arrow button is clicked
    console.log('Right arrow button clicked');
    type = (type + 1) % 3;
    changeButton();
    drawCalendar();
  });
});

function changeButton() {
  const buttonText = document.getElementById('button-text');
  switch (type) {
    case 0: 
      buttonText.textContent = "Mood Heatmap"
      break;
    case 1: 
      buttonText.textContent = "Minutes of Sleep Heatmap"
      break;
    case 2: 
      buttonText.textContent = "Minutes of Activity Heatmap"
      break;
    default:
      console.log("UHHHH");
  }
}