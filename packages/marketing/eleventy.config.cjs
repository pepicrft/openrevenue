module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/styles.css": "styles.css" });
  eleventyConfig.addPassthroughCopy({ "src/og.svg": "og.svg" });
  eleventyConfig.addPassthroughCopy({ "src/og.png": "og.png" });

  return {
    dir: {
      input: "src",
      output: "dist",
    },
  };
};
