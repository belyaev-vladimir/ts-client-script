/**
 * @param {callback} cb callback before shutdown this application
 */
export const exitHelper = (cb) => {
  let handlers = [];

  const events: string[] = ["SIGINT", "SIGTERM", "SIGQUIT"];

  events.forEach((key: string) => {
    let handler = (...args: any[]) => {
      let targetArgs = Array.prototype.slice.call(args, 0);
      targetArgs.unshift(key);
      cb.apply(null, targetArgs);
    };

    process.on(key, handler);

    handlers.push([key, handler]);
  });

  return () => {
    handlers.forEach((args) => {
      let key = args[0];
      let handler = args[1];
      process.removeListener(key, handler);
    });
  };
};
