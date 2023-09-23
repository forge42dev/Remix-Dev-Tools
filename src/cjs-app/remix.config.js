 

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  watchPaths: ["../../dist"],
  serverModuleFormat: "cjs",
  tailwind: true,
  /* routes(defineRoutes) {
    return createRoutesFromFolders(defineRoutes);
  }, */
  
 
};
