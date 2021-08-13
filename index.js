import fetch from "node-fetch";
import ICalParser from "ical-js-parser";
import moment from "moment-timezone";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const getSourceCal = async () =>
  await (
    await fetch("http://ics.benchapp.com/eyJwbGF5ZXJJZCI6NjMwODZ9")
  ).text();

const resultJSON = ICalParser.default.toJSON(await getSourceCal());
const newEvents = [];

resultJSON.events
  .map((event) => ({ ...event, url: event.url.value }))
  .forEach((event) => {
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
      summary: event.location && "Drive to " + event.location.split(" - ")[0],
      location: "",
      description: "",
      uid: uuidv4(),
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
      summary:
        event.description &&
        "Dress in " + event.description.split("Notes: ")[1],
      description: "",
      uid: uuidv4(),
    };
    newEvents.push(drive);
    newEvents.push(dress);
    newEvents.push(event);
  });

resultJSON.events = newEvents;

const resultIcal = ICalParser.default.toString(resultJSON);

var dir = "./output";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

fs.writeFileSync("./output/benchapp.ical", resultIcal);
