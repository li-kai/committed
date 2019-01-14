function makeValidator({ name, pattern, errorMsg }) {
  return (config) => {
    const res = pattern.exec(config.string);
    if (res === null) {
      if (!errorMsg) {
        return { ...config };
      }

      return {
        ...config,
        errors: config.errors.concat(errorMsg),
      };
    }

    const value = res[0];
    const endIndex = res.index + value.length;
    const restOfString = config.string.slice(endIndex);

    const result = {
      ...config,
      string: restOfString,
      matches: { ...config.matches },
    };

    if (name) {
      result.matches[name] = value;
    }

    return result;
  };
}

module.exports = {
  makeValidator,
};
