const HOVER_COLOR = "#EFAE88";
const MAP_COLOR = "#fff2e3";
let districtCount = localStorage.getItem("selectedDistricts")
  ? JSON.parse(localStorage.getItem("selectedDistricts")).length
  : 0;
document.getElementById("district_count").innerHTML = districtCount;

d3.json("istanbul.json").then(function (data) {
  let width = 1200;
  height = 800;
  let projection = d3.geoEqualEarth();
  projection.fitSize([width, height], data);
  let path = d3.geoPath().projection(projection);

  let svg = d3
    .select("#map_container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  let g = svg
    .append("g")
    .selectAll("path")
    .data(data.features)
    .join("path")
    .attr("d", path)
    .attr("fill", function (d, i) {
      if (localStorage.getItem("selectedDistricts")) {
        if (
          JSON.parse(localStorage.getItem("selectedDistricts")).includes(
            d.properties.name
          )
        ) {
          d.noFill = true;
          return HOVER_COLOR;
        } else return MAP_COLOR;
      } else return MAP_COLOR;
    })
    .attr("stroke", "#000")
    .on("mouseover", function (d, i) {
      d3.select(this).attr("fill", HOVER_COLOR);
    })
    .on("mouseout", function (d, i) {
      if (!d.noFill) d3.select(this).attr("fill", MAP_COLOR);
    })
    .on("click", function (d, i) {
      d.noFill = d.noFill || false;
      if (!d.noFill) {
        districtCount++;
        document.getElementById("district_count").innerHTML = districtCount;
        d3.select(this).attr("fill", HOVER_COLOR);

        //add selected district to localStorage
        if (localStorage.getItem("selectedDistricts")) {
          let tempselectedDistricts = JSON.parse(
            localStorage.getItem("selectedDistricts")
          );
          if (tempselectedDistricts.includes(d.properties.name)) return;
          tempselectedDistricts.push(d.properties.name);
          localStorage.setItem(
            "selectedDistricts",
            JSON.stringify(tempselectedDistricts)
          );
        } else {
          let tempArr = [];
          tempArr.push(d.properties.name);
          localStorage.setItem("selectedDistricts", JSON.stringify(tempArr));
        }
      } else {
        districtCount--;
        document.getElementById("district_count").innerHTML = districtCount;
        d3.select(this).attr("fill", MAP_COLOR);

        //remove from localStorage
        let tempselectedDistricts = JSON.parse(
          localStorage.getItem("selectedDistricts")
        );
        const index = tempselectedDistricts.indexOf(d.properties.name);
        if (index !== -1) {
          tempselectedDistricts.splice(index, 1);
        }
        localStorage.setItem(
          "selectedDistricts",
          JSON.stringify(tempselectedDistricts)
        );
      }
      d.noFill = !d.noFill;
    });

  console.log(data.features.map((f) => f.properties.name));

  g = svg.append("g");

  g.selectAll("text")
    .data(data.features)
    .enter()
    .append("text")
    .text(function (d) {
      return d.properties.name;
    })
    .attr("x", function (d) {
      return path.centroid(d)[0];
    })
    .attr("y", function (d) {
      return path.centroid(d)[1];
    })
    .attr("text-anchor", "middle")
    .attr("font-size", "10pt")
    .attr("style", "color: black;")
    .attr("style", "pointer-events: none;");
});

function downloadMap() {
  let div = document.getElementById("map_container");
  html2canvas(div).then(function (canvas) {
    var destCanvas = document.createElement("canvas");
    destCanvas.width = canvas.width;
    destCanvas.height = canvas.height;
    var destCtx = destCanvas.getContext("2d");
    destCtx.drawImage(canvas, 0, 0);

    destCanvas.toBlob(function (blob) {
      saveAs(blob, "districtvisited.png");
    });
  });
}

function resetButton() {
  localStorage.removeItem("selectedDistricts")
  districtCount = 0; document.getElementById("district_count").innerHTML = districtCount;
  location.reload()
}
