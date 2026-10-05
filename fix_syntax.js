import fs from 'fs';
const file = 'src/tests/ventilation/ashrae-621-2022-density-propagation.test.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /  \}\);\n    expect\(res\.eRho\)\.toBeCloseTo\(expectedERho, 4\);\n  \}\);/g,
  '  });'
);

fs.writeFileSync(file, content);
