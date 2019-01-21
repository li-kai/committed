const logger = {
  fatal(message: string) {
    console.error(message);
    return process.exit(1);
  },
  debug(message: string) {},
};

if (process.env.DEBUG) {
  logger.debug = console.log;
}

export default logger;
