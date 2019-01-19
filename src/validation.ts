export type Config = {
  string: string;
  matches: { [key: string]: string };
  errors: string[];
}

type ValidatorArgs = {
  name: string;
  pattern: RegExp;
  errorMsg: string;
}
function makeValidator({ name, pattern, errorMsg }: ValidatorArgs) {
  return (config: Config) => {
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
      matches: { ...config.matches },
      string: restOfString,
    };

    if (name) {
      result.matches[name] = value;
    }

    return result;
  };
}

export { makeValidator };
