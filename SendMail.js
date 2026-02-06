// SendMail.js
import "dotenv/config";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

console.log("📨 メール送信処理を開始します");

// ============================
// メール送信本体
// ============================
async function sendHtmlByMail({ htmlPath, keyword, media }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.error("❌ GMAIL_USER または GMAIL_APP_PASSWORD が設定されていません");
    process.exit(1);
  }

  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ HTMLファイルが存在しません: ${htmlPath}`);
    process.exit(1);
  }

  const htmlContent = fs.readFileSync(htmlPath, "utf-8");
  const fileName = path.basename(htmlPath);

  console.log("📄 添付ファイル:", fileName);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  await transporter.verify();
  console.log("✅ SMTP 接続確認 OK");

  const mailOptions = {
    from: user,
    to: "g-1000017355-693493@mail.talknote.com",
    subject: `【🟥記事通知】${keyword}`,
    text: `
／
🗣️ リライト完了しました！
＼

■ メディア
${media}

■ キーワード
${keyword}

■ ファイル名
${fileName}

※ 下記HTMLはそのままコピペ可能です
`.trim(),
    attachments: [
      {
        filename: fileName,
        content: htmlContent,
        contentType: "text/html",
      },
    ],
  };

  await transporter.sendMail(mailOptions);
  console.log("🎉 Talknote へメール送信成功！");
}

// ============================
// CLI エントリーポイント
// ============================
async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("❌ 使用例: node SendMail.js input.json");
    process.exit(1);
  }

  const input = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  const { articleId, keyword, media } = input;

  const safeKeyword = keyword.replace(/[\\\/:*?"<>|]/g, "_");
  const htmlFileName = `${articleId}_${media}${safeKeyword}.html`;
  const htmlPath = path.join(process.cwd(), htmlFileName);

  try {
    await sendHtmlByMail({ htmlPath, keyword, media });
  } catch (err) {
    console.error("❌ メール送信失敗:", err);
    process.exit(1);
  }
}

main();
