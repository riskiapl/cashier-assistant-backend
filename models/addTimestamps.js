const fs = require("fs");
const path = require("path");

const modelsDir = path.join(__dirname);

function updateModelFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Regex untuk menemukan blok konfigurasi sequelize define
  const configBlockRegex =
    /(\{\s*sequelize[\s\S]*?timestamps:\s*true[\s\S]*?)(indexes:)/;

  if (configBlockRegex.test(content)) {
    content = content.replace(
      configBlockRegex,
      (match, configStart, indexesKey) => {
        // Pastikan createdAt dan updatedAt belum ada
        if (
          !configStart.includes("createdAt:") &&
          !configStart.includes("updatedAt:")
        ) {
          return `${configStart}createdAt: 'created_at', updatedAt: 'updated_at', ${indexesKey}`;
        }
        return match;
      }
    );

    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated timestamps config in ${path.basename(filePath)}`);
  } else {
    console.warn(`No valid configuration found in ${path.basename(filePath)}`);
  }
}

fs.readdirSync(modelsDir)
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    const filePath = path.join(modelsDir, file);
    updateModelFile(filePath);
  });
