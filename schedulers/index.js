const fs = require("fs");
const path = require("path");

const start = () => {
  const schedulersDirectory = path.resolve("schedulers");
  const files = fs.readdirSync(schedulersDirectory);
  for (const file of files) {
    const fullPath = `${schedulersDirectory}/${file}`;
    if (fs.existsSync(fullPath) && fullPath.endsWith(".scheduler.js")) {
      const schedulers = require(`./${file}`);
      for (const scheduler in schedulers) {
        if (Object.hasOwnProperty.call(schedulers, scheduler)) {
          const schedulerFunction = schedulers[scheduler];
          schedulerFunction();
        }
      }
    }
  }
};

module.exports = {
  start,
};
