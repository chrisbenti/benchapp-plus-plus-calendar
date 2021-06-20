import fetch from "node-fetch";
import ICalParser from "ical-js-parser";
import moment from "moment-timezone";
import fs from "fs";

const getSourceCal = async () =>
  await (
    await fetch("http://ics.benchapp.com/eyJwbGF5ZXJJZCI6NjMwODZ9")
  ).text();

const resultJSON = ICalParser.default.toJSON(await getSourceCal());

resultJSON.events.forEach((event) => {
  const drive = {
    ...event,
    dtstart: {
      ...event.dtstart,
      value: moment(event.dtstart.value).subtract(1, "h").utc().format(),
    },
    dtend: {
      ...event.dtstart,
      value: moment(event.dtstart.value).subtract(30, "m").utc().format(),
    },
    summary: "Drive to " + event.location.split(" - ")[0],
    location: null,
    description: null,
  };

  const dress = {
    ...event,
    dtstart: {
      ...event.dtstart,
      value: moment(event.dtstart.value).subtract(30, "m").utc().format(),
    },
    dtend: {
      ...event.dtstart,
      value: event.dtstart.value,
    },
    summary: "Dress in " + event.description.split("Notes: ")[1],
    description: null,
  };
  resultJSON.events.push(drive);
  resultJSON.events.push(dress);
});

const resultIcal = ICalParser.default.toString(resultJSON);

var dir = "./output";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

fs.writeFileSync("./output/benchapp.ical", resultIcal);
