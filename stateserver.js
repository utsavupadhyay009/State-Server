let express = require("express");
let bodyParser = require("body-parser");
let url = require("url");
let querystring = require("querystring");
let fs = require("fs");

let rawdata = fs.readFileSync("states.json");
let states = JSON.parse(rawdata);
let app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.post("/", (req, res) => {
  let longitude = req.body.longitude;
  let latitude = req.body.latitude;
  let finalResult = [];

  if (!longitude || longitude === "" || (!latitude || latitude === "")) {
    res.status(500).json({
      error: "Please provide both longitude and latitude"
    });
  } else {
    let objectPresent = false;

    for (let i = 0; i < states.length; i++) {
      let currentState = states[i];
      let borderBoundries = currentState.border;

      if (pointIsPresent(longitude, latitude, borderBoundries)) {
        finalResult.push(currentState.state);
        objectPresent = true;
        break;
      }
    }

    if (objectPresent === false) {
      res.status(500).json({
        error: "state does not exist."
      });
    } else {
      res.json(finalResult);
    }
  }
});

function pointIsPresent(longitude, latitude, boundary) {
  let pointInside = false;
  for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
    
    
    let longitudeX =  boundary[i][0];
    let latitudeX  =  boundary[i][1];
    let longitudeY =  boundary[j][0];
    let latitudeY  =  boundary[j][1];

    let intersect =
      latitudeX > latitude != latitudeY > latitude && longitude < (longitudeY - longitudeX) * (latitude - latitudeX) / (latitudeY - latitudeX) + longitudeX;
    if (intersect) {pointInside = !pointInside};
  }
  return pointInside;
}

app.listen(8080, () => {
  console.log("Server is up on port 8080");
});