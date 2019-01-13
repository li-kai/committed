const report = {
  error(message) {
    console.error(message);
    process.exit(1);
  },
};

module.exports = report;
