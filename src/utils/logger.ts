const logger = {
  fatal(message: string) {
    console.error(message);
    return process.exit(1);
  },
};

export default logger;
