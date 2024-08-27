const run = require("../helpers/geminiApi.js");


const GetOutPut = async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await run(prompt);
    res.status(200).json({ answer: response });
  } catch (error) {
    return res.status(503).json(error.message);
  }
};


module.exports = { GetOutPut };
