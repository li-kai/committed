function makeValidator(key, regex, errorMsg) {
  return (config) => {
    const res = regex.exec(config.string);
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

    if (key) {
      result.matches[key] = value;
    }

    return result;
  };
}

module.exports = {
  makeValidator,
};
