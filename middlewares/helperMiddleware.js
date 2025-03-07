const cleanNullValues = (req, res, next) => {
  const originalJson = res.json;

  res.json = (data) => {
    const cleanData = JSON.parse(
      JSON.stringify(data, (key, value) => (value === "NULL" ? null : value))
    );
    originalJson.call(res, cleanData);
  };

  next();
};

const removeUnusedKey = (req, res, next) => {
  const originalJson = res.json;

  res.json = (data) => {
    const cleanData = JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (
          key === "created_at" ||
          key === "updated_at" ||
          key === "action_type" ||
          key === "password" ||
          key === "plain_password"
        ) {
          return undefined;
        }
        return value;
      })
    );
    originalJson.call(res, cleanData);
  };

  next();
};

module.exports = { cleanNullValues, removeUnusedKey };
