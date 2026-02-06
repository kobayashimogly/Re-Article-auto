// runAll.js
import { execSync } from "child_process";
import fs from "fs";

function safeExec(cmd) {
  console.log(`\n▶️ 実行: ${cmd}`);
  execSync(cmd, {
    stdio: "inherit",
    maxBuffer: 1024 * 1024 * 200,
  });
}

async function main() {
  const inputPath = process.argv[2];

  if (!inputPath || !fs.existsSync(inputPath)) {
    console.log("使用例: node runAll.js input.json");
    return;
  }

  const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const { keyword } = input;

  console.log(`
========================================
🚀 全自動 SEO記事生成フルパイプライン開始
========================================
`);

  // PhaseA：HTML → JSON
  safeExec(`node index.js ${inputPath}`);

  // PhaseB：競合検索
  safeExec(`node src/scrapeAll.js "${keyword}"`);

  // PhaseC：構成整理
  safeExec(`node src/phaseC/runPhaseC.js "${keyword}"`);

  // PhaseD：本文生成
  safeExec(`node src/phaseD/runPhaseD.js "${keyword}"`);

  // PhaseE：構成追加（h2/h3）
  safeExec(`node src/phaseE/runPhaseE.js "${keyword}"`);

  // 再度 PhaseD（追加ブロック本文）
  safeExec(`node src/phaseD/runPhaseD.js "${keyword}"`);

  // HTML生成
  safeExec(`node generateHtml.js ${inputPath}`);

  // メール送信
  safeExec(`node SendMail.js ${inputPath}`);

  console.log(`
========================================
🎉 全工程完了！
========================================
`);
}

main();
