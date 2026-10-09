export interface Exercise {
  id: string;
  title: string;
  titleEn: string;
  position: string;
  instruction: string;
  breathing: string;
  result: string;
  caution?: string;
  animationUrl: string;
}

export const EXERCISES_DATA: Exercise[] = [
  {
    id: "head-side-to-side",
    title: "خم کردن سر به طرفین",
    titleEn: "Head Side to Side",
    position: "نشسته یا ایستاده",
    instruction:
      "سر خود را به‌آرامی به سمت شانه راست خم کنید تا در سمت چپ گردن کشش ملایمی احساس شود؛ سپس همین حرکت را به سمت چپ انجام دهید.",
    breathing:
      "هنگام خم کردن سر بازدم کنید و هنگام بازگشت به مرکز دم بگیرید.",
    result: "کاهش فشار و گرفتگی عضلات گردن و شانه.",
    caution: "از چرخش ناگهانی یا فشار دادن سر با دست خودداری کنید.",
    animationUrl: "/animations/head-side-to-side-h264.mp4",
  },
  {
    id: "arm-raises",
    title: "بالا و پایین بردن دست‌ها",
    titleEn: "Arm Raises",
    position: "ایستاده یا نشسته",
    instruction:
      "دست‌ها را در جلوی بدن نگه دارید و به‌صورت متناوب، هر بار یکی از دست‌ها را کمی بالا ببرید و پایین بیاورید.",
    breathing: "هنگام بالا بردن دست بازدم کنید و هنگام پایین آوردن آن دم بگیرید.",
    result: "کمک به کاهش خشکی و خستگی دست‌ها و شانه‌ها.",
    animationUrl: "/animations/arm-raises-h264.mp4",
  },
  {
    id: "arm-swings",
    title: "کشش دست ها به سمت عقب",
    titleEn: "Arm Swings",
    position: "ایستاده",
    instruction:
      "در حالت ایستاده دست‌ها را در کنار بدن نگه دارید. به‌آرامی و به‌صورت هم زمان دست هارا کمی به عقب برده و سپس به حالت قبل برگردانید. ",
    breathing: "تنفس آرام و منظم داشته باشید.",
    result: "کمک به کاهش گرفتگی عضلات سینه و شانه.",
    animationUrl: "/animations/arm-swings-h264.mp4",
  },
  {
    id: "cross-body-shoulder-stretch",
    title: "کشش شانه از روی سینه",
    titleEn: "Cross-Body Shoulder Stretch",
    position: "نشسته یا ایستاده",
    instruction:
      "یک دست را صاف از جلوی سینه به سمت شانه مخالف ببرید. با دست دیگر، بازوی کشیده‌شده را به‌آرامی به سمت بدن نزدیک کنید. سپس همین حرکت را با دست دیگر تکرار کنید.",
    breathing: "در طول کشش، آرام و یکنواخت تنفس کنید.",
    result: "کمک به کاهش خستگی و گرفتگی عضلات شانه.",
    caution: "بازو را به‌آرامی بکشید و از فشار بیش‌ازحد خودداری کنید.",
    animationUrl: "/animations/cross-body-shoulder-stretch-h264.mp4",
  },
  {
    id: "flex-wrist-forward",
    title: "کشش مچ به جلو (خم به پایین)",
    titleEn: "Wrist Flexion Stretch",
    position: "نشسته",
    instruction:
      "یک دست را در مقابل بدن صاف نگه دارید و انگشتان آن را به سمت پایین بگیرید. با دست دیگر، انگشتان را به‌آرامی به سمت خود بکشید؛ سپس همین حرکت را با دست دیگر تکرار کنید.",
    breathing: "آرام و طبیعی نفس بکشید.",
    result: "کمک به کاهش خستگی و گرفتگی مچ دست و ساعد.",
    caution: "انگشتان را فقط تا جایی بکشید که احساس کشش ملایم داشته باشید.",
    animationUrl: "/animations/flex-wrist-forward-h264.mp4",
  },
  {
    id: "flex-wrist-backward",
    title: "کشش مچ به عقب (خم به بالا)",
    titleEn: "Wrist Extension Stretch",
    position: "نشسته",
    instruction:
      "یک دست را در مقابل بدن صاف نگه دارید، کف دست را رو به جلو و انگشتان را رو به بالا بگیرید. با دست دیگر، انگشتان را به‌آرامی به سمت عقب بکشید؛ سپس همین حرکت را با دست دیگر تکرار کنید.",
    breathing: "آرام و منظم نفس بکشید.",
    result: "کمک به کاهش فشار و گرفتگی ساعد و مچ دست.",
    caution: "از کشیدن شدید انگشتان خودداری کنید.",
    animationUrl: "/animations/flex-wrist-backward-h264.mp4",
  },
  {
    id: "seated-side-bend",
    title: "خم شدن به طرفین در حالت نشسته",
    titleEn: "Seated Side Bend",
    position: "نشسته روی صندلی",
    instruction:
      "صاف روی صندلی بنشینید. دست ها در کنار بدن آویزان باشند،  تنه را به‌آرامی به یک سمت خم کنید تا در پهلوی مخالف کشش ملایمی احساس شود؛ سپس به حالت اول برگردید و حرکت را با سمت دیگر تکرار کنید.",
    breathing: "هنگام خم شدن بازدم کنید و هنگام برگشت به حالت صاف دم بگیرید.",
    result: "کمک به کاهش خشکی پهلوها و کمر.",
    caution: "تنه را به جلو یا عقب خم نکنید و حرکت را آرام انجام دهید.",
    animationUrl: "/animations/seated-side-bend-h264.mp4",
  },
  {
    id: "trunk-twist",
    title: "چرخش تنه (تویست)",
    titleEn: "Trunk Twist",
    position: "ایستاده",
    instruction:
      "صاف بایستید و دست‌ها را دور تنه قلاب کنید، طوری که گویی خودتان را در آغوش گرفته‌اید. تنه را به‌آرامی به یک سمت بچرخانید، سپس به حالت روبه‌رو برگردید و حرکت را به سمت دیگر تکرار کنید.",
    breathing: "هنگام چرخش بازدم کنید و هنگام برگشت به مرکز دم بگیرید.",
    result: "کمک به کاهش خشکی تنه و پشت.",
    caution: "چرخش را آرام و بدون حرکت ناگهانی انجام دهید.",
    animationUrl: "/animations/trunk-twist-h264.mp4",
  },
  {
    id: "back-arch",
    title: "قوس دادن به پشت",
    titleEn: "Back Arch",
    position: "نشسته روی صندلی",
    instruction:
      "روی صندلی بنشینید و دست‌ها را روی زانوها قرار دهید. به‌آرامی گردن و کمر را کمی به سمت جلو قوس دهید، سپس به حالت صاف برگردید.",
    breathing: "هنگام قوس دادن دم بگیرید و هنگام برگشت به حالت صاف بازدم کنید.",
    result: "کمک به کاهش خشکی گردن و کمر.",
    caution: "حرکت را آرام انجام دهید و از قوس دادن بیش‌ازحد گردن یا کمر خودداری کنید.",
    animationUrl: "/animations/back-arch-h264.mp4",
  },
  {
    id: "ankle-and-leg-extension",
    title: "دراز کردن پا و حرکت مچ پا",
    titleEn: "Ankle and Leg Extension",
    position: "نشسته روی صندلی",
    instruction:
      "روی صندلی بنشینید و یک پا را در مقابل بدن دراز کنید. انگشتان پا را به سمت بدن بکشید، سپس پا را جمع کنید و به حالت اول برگردانید. حرکت را با پای دیگر تکرار کنید.",
    breathing: "هنگام دراز کردن پا بازدم کنید و هنگام جمع کردن آن دم بگیرید.",
    result: "کمک به حرکت دادن پاها و کاهش خشکی ناشی از نشستن طولانی.",
    caution: "حرکت را آرام انجام دهید و زانو را بیش‌ازحد قفل نکنید.",
    animationUrl: "/animations/ankle-and-leg-extension-h264.mp4",
  },
  {
    id: "arms-forward-and-up",
    title: "بالا بردن دست‌ها به جلو",
    titleEn: "Arms Forward and Up",
    position: "ایستاده یا نشسته",
    instruction:
      "دست‌ها را از جلوی بدن به‌آرامی تا سطح شانه یا بالای سر بالا ببرید و سپس با کنترل به حالت اول بازگردانید.",
    breathing: "هنگام بالا بردن دست‌ها دم بگیرید و هنگام پایین آوردن بازدم کنید.",
    result: "کمک به کاهش خشکی مفاصل شانه و افزایش گردش خون در اندام فوقانی.",
    animationUrl: "/animations/arms-forward-and-up-h264.mp4",
  },
  {
    id: "back-extension",
    title: "باز کردن و کشش پشت",
    titleEn: "Back Extension",
    position: "ایستاده یا نشسته",
    instruction:
      "صاف قرار بگیرید، دست‌ها را روی گودی کمر بگذارید. شانه‌ها را به‌آرامی به عقب بکشید و قفسه سینه را باز کنید؛ سپس به حالت اولیه بازگردید.",
    breathing: "هنگام باز کردن قفسه سینه دم عمیق بکشید و هنگام بازگشت بازدم کنید.",
    result: "کاهش فشار ناشی از خمیدگی طولانی‌مدت به جلو و بهبود راستای ستون فقرات.",
    caution: "از ایجاد قوس شدید یا پرتاب ناگهانی کمر به عقب خودداری کنید.",
    animationUrl: "/animations/back-extension-h264.mp4",
  },
  {
    id: "reach-for-the-sky",
    title: "کشش دست‌ها به سمت بالا",
    titleEn: "Reach for the Sky",
    position: "ایستاده یا نشسته",
    instruction:
      "روی صندلی بنشینید. یکی از دست ها را به سمت بالا کشیده و آرام به سمت پلهوی مخالف خم شوید تا کشش خفیفی احساس شود و سپس به حالت اول برگردید. این کار را با سمت مخالف نیز تکرار کنید.",
    breathing: "هنگام بالا بردن و کشش دست‌ها دم بگیرید و هنگام پایین آوردن بازدم کنید.",
    result: "کاهش فشردگی مهره‌ها و رفع خستگی عضلات پشت و شانه.",
    animationUrl: "/animations/reach-for-the-sky-h264.mp4",
  },
  {
    id: "standing-side-bend",
    title: "خم شدن به طرفین در حالت ایستاده",
    titleEn: "Standing Side Bend",
    position: "ایستاده",
    instruction:
      "صاف بایستید، دست ها را پشت سر قلاب کرده و سر را کمی به سمت عقب فشار دهید. آرام به سمت پهلوی راست خم شوید، سپس به حالت اول برگشته و حرکت را با سمت دیگر تکرار کنید. .",
    breathing: "هنگام خم شدن به پهلو بازدم کنید و هنگام بازگشت به حالت ایستاده دم بگیرید.",
    result: "افزایش انعطاف‌پذیری ستون فقرات و کاهش گرفتگی عضلات پهلو و کمر.",
    caution: "از متمایل شدن تنه به سمت جلو یا عقب حین خم شدن خودداری کنید.",
    animationUrl: "/animations/standing-side-bend-h264.mp4",
  },
  {
    id: "walking",
    title: "راه رفتن و تحرک درجا",
    titleEn: "Walking",
    position: "ایستاده",
    instruction:
      "از جای خود برخیزید و برای چند دقیقه با گام‌های آرام و پیوسته در محیط کار  راه بروید.",
    breathing: "در حین حرکت تنفس آرام، عمیق و یکنواخت داشته باشید.",
    result: "شکستن الگوی نشستن طولانی‌مدت، بهبود گردش خون عمومی و رفع خستگی عضلات پا.",
    animationUrl: "/animations/walking-h264.mp4",
  },
];
