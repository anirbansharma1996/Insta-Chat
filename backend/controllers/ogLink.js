const ogs = require("open-graph-scraper");

const urlEncoded = async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Please provide a URL" });
  }
  try {
    const options = { url };
    const { result } = await ogs(options);
  

    if (result.success) {
      res.json({
        title: result.ogTitle || "",
        description: result.ogDescription || "",
        image: result.ogImage[0]?.url || "",
        url: result.requestUrl || url,
      });
    } else {
      res.status(404).json({ error: "No OG data found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = urlEncoded;
