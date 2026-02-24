const fs = require('fs');
const file = 'prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/@default\(dbgenerated\("uuid_generate_v4\(\)"\)\)/g, '@default(uuid())');
fs.writeFileSync(file, content);
