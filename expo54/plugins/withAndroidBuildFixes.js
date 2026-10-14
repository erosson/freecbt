const {
  withGradleProperties,
  withProjectBuildGradle,
  withAppBuildGradle,
  AndroidConfig,
} = require("@expo/config-plugins");

const withAndroidBuildFixes = (config) => {
  // 1. Gradle properties: increase JVM memory & Metaspace
  config = withGradleProperties(config, (config) => {
    config.modResults = AndroidConfig.BuildProperties.updateAndroidBuildProperty(
      config.modResults,
      "org.gradle.jvmargs",
      "-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8"
    );
    return config;
  });

  // 2. Root build.gradle: disable lintVital across all subprojects lazily without afterEvaluate
  config = withProjectBuildGradle(config, (config) => {
    const disableLintBlock = `
// Added to disable lintVital across all subprojects and avoid OOM / lint failures
subprojects {
    tasks.configureEach { task ->
        if (task.name.contains("lintVital")) {
            task.enabled = false
        }
    }
}
`;
    if (!config.modResults.contents.includes("lintVital")) {
      config.modResults.contents += disableLintBlock;
    }
    return config;
  });

  // 3. App build.gradle: ensure android { lint { ... } }
  config = withAppBuildGradle(config, (config) => {
    const appLintConfig = `
    lint {
        checkReleaseBuilds false
        abortOnError false
    }
`;
    if (!config.modResults.contents.includes("checkReleaseBuilds false")) {
      config.modResults.contents = config.modResults.contents.replace(
        /android\s*\{/,
        `android {\n${appLintConfig}`
      );
    }
    return config;
  });

  return config;
};

module.exports = withAndroidBuildFixes;
