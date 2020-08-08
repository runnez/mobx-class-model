export const config = {
  autoObservable: false
};

export const conifgure = (options: typeof config) => {
  Object.assign(config, options);
};
