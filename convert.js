const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// مسیر ffmpeg.exe
const ffmpegPath = path.join(
  __dirname,
  'ffmpeg-9.0.2-essentials_build',
  'ffmpeg-9.0.2-essentials_build',
  'bin',
  'ffmpeg.exe'
);

const animationsDir = path.join(__dirname, 'public', 'animations');

if (!fs.existsSync(ffmpegPath)) {
  console.error('❌ فایل ffmpeg.exe در این مسیر پیدا نشد:');
  console.error(ffmpegPath);
  process.exit(1);
}

if (!fs.existsSync(animationsDir)) {
  console.error('❌ پوشهٔ public/animations پیدا نشد:');
  console.error(animationsDir);
  process.exit(1);
}

const files = fs
  .readdirSync(animationsDir)
  .filter((file) => file.toLowerCase().endsWith('.mp4'))
  .filter((file) => !file.toLowerCase().endsWith('-h264.mp4'));

if (files.length === 0) {
  console.log('✅ ویدیوی تبدیل‌نشده‌ای پیدا نشد.');
  process.exit(0);
}

console.log(`🎬 تعداد ویدیوهای قابل تبدیل: ${files.length}`);

let success = 0;
let failed = 0;

for (const file of files) {
  const input = path.join(animationsDir, file);
  const outputName = `${path.parse(file).name}-h264.mp4`;
  const output = path.join(animationsDir, outputName);

  console.log(`\n🔄 در حال تبدیل: ${file}`);

  try {
    execFileSync(
      ffmpegPath,
      [
        '-i', input,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        '-y',
        output,
      ],
      { stdio: 'inherit' }
    );

    console.log(`✅ ساخته شد: ${outputName}`);
    success++;
  } catch (error) {
    console.error(`❌ تبدیل این فایل ناموفق بود: ${file}`);
    failed++;
  }
}

console.log(`\nتمام شد. موفق: ${success} | ناموفق: ${failed}`);
