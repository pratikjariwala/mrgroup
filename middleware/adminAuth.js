const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role == 0) {
      return res
        .status(403)
        .json({ errors: [{ msg: "Admin resources access denied" }] });
    }
    next();
  } catch (error) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
