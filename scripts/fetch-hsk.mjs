import fs from 'node:fs/promises';
import path from 'node:path';

const BASE =
  'https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main';
const LEVELS = [1, 2];
const OUT_DIR = 'content';
const SOURCE_DIR = path.join(OUT_DIR, 'source');

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${url}`);
  }
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${url}`);
  }
  return res.text();
}

async function main() {
  const merged = [];

  for (const level of LEVELS) {
    const url = `${BASE}/wordlists/exclusive/old/${level}.json`;
    const items = await fetchJson(url);
    for (const item of items) {
      const form = item.forms && item.forms[0];
      if (!form) continue;
      merged.push({
        term: item.simplified,
        hskLevel: level,
        frequency: item.frequency ?? null,
        pos: item.pos ?? [],
      });
    }
  }

  // 同一个词可能跨级别出现，保留较低级别。
  const byTerm = new Map();
  for (const word of merged) {
    if (!word.term) continue;
    const previous = byTerm.get(word.term);
    if (!previous || word.hskLevel < previous.hskLevel) {
      byTerm.set(word.term, word);
    }
  }

  const words = [...byTerm.values()].sort(
    (a, b) =>
      a.hskLevel - b.hskLevel ||
      (a.frequency ?? Number.MAX_SAFE_INTEGER) -
        (b.frequency ?? Number.MAX_SAFE_INTEGER)
  );

  const output = {
    source: {
      name: 'Complete HSK Vocabulary',
      repo: 'https://github.com/drkameleon/complete-hsk-vocabulary',
      files: [
        `${BASE}/wordlists/exclusive/old/1.json`,
        `${BASE}/wordlists/exclusive/old/2.json`,
      ],
      license: 'MIT',
      accessedAt: '2026-11-27',
      note:
        '仅提取词目、HSK 等级、词频、词性；不取源数据中的拼音和英文释义。拼音由 pinyin-pro 生成，中文释义与例句由本项目原创。',
    },
    words,
  };

  await fs.mkdir(SOURCE_DIR, { recursive: true });
  await fs.writeFile(
    path.join(SOURCE_DIR, 'hsk-2.0-level1-2.json'),
    `${JSON.stringify(output, null, 2)}\n`
  );

  const license = await fetchText(`${BASE}/LICENSE`);
  await fs.writeFile(path.join(OUT_DIR, 'LICENSE-HSK.txt'), license);

  console.log(
    `Wrote ${words.length} words to content/source/hsk-2.0-level1-2.json`
  );
  console.log('Wrote content/LICENSE-HSK.txt');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
