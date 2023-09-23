import chalk from "chalk";
import { getConfig } from "./config.js";

const log = (message: string) => {
  const config = getConfig();
  if (config.silent) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log(message);
};

const logPrefix = (prefix: string) => ` ${chalk.white(prefix.toLowerCase())} `;

export const errorLog = (message: string) => {
  log(`${chalk.redBright.bold("ERROR")} ${message}`);
};

export const redirectLog = (message: string) => {
  log(`${chalk.redBright.bold("REDIRECT")} ${message}`);
};

export const infoLog = (message: string) => {
  log(`${chalk.blueBright.bold("INFO")} ${message}`);
};

export const loaderLog = (message: string) => {
  const config = getConfig();
  if (config.logs?.loaders === false) {
    return;
  }
  log(`${chalk.green.bold("LOADER")} ${message}`);
};

export const actionLog = (message: string) => {
  const config = getConfig();
  if (config.logs?.actions === false) {
    return;
  }
  log(`${chalk.red.bold("ACTION")} ${message}`);
};

export const successLog = (message: string) => {
  log(`${chalk.greenBright.bold("SUCCESS")} ${message}`);
};

export const warningLog = (message: string) => {
  log(`${chalk.bgYellow(logPrefix("WARNING"))} ${message}`);
};

export const debugLog = (message: string) => {
  log(`${chalk.bgMagenta(logPrefix("DEBUG"))} ${message}`);
};
