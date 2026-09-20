import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting MathVerse question bank seed...');

  // =========================================
  // پاک کردن داده‌های وابسته
  // =========================================

  await prisma.practiceAnswer.deleteMany();
  await prisma.practiceHistory.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.practiceAttempt.deleteMany();

  // پاک کردن سوال‌های قبلی
  await prisma.question.deleteMany();

  // =========================================
  // Question Bank
  // پایه هفتم
  // 3 فصل
  // هر فصل: 10 سوال
  // Level 1 / Level 2 / Level 3
  // =========================================

  const questions = [

    // =====================================================
    // فصل 1 - راهبرد حل مسئله
    // =====================================================

    {
      title: 'برای حل یک مسئله ابتدا چه کاری انجام می‌دهیم؟',
      description: 'راهبرد حل مسئله',
      subject: 'Math7',
      chapter: 'فصل 1 - راهبرد حل مسئله',
      difficulty: 1,
      optionA: 'فهمیدن مسئله',
      optionB: 'حدس زدن',
      optionC: 'محاسبه سریع',
      optionD: 'رسم شکل',
      correctAnswer: 'A',
      score: 10,
    },

    {
      title: 'حاصل 8 + 4 × 2 چیست؟',
      description: 'اولویت عملیات',
      subject: 'Math7',
      chapter: 'فصل 1 - راهبرد حل مسئله',
      difficulty: 1,
      optionA: '24',
      optionB: '16',
      optionC: '20',
      optionD: '12',
      correctAnswer: 'B',
      score: 10,
    },

    {
      title: 'اگر مسئله‌ای سخت باشد بهترین راه چیست؟',
      description: 'راهبرد حل مسئله',
      subject: 'Math7',
      chapter: 'فصل 1 - راهبرد حل مسئله',
      difficulty: 2,
      optionA: 'رها کردن مسئله',
      optionB: 'تقسیم به بخش‌های کوچک‌تر',
      optionC: 'حذف اطلاعات',
      optionD: 'حدس تصادفی',
      correctAnswer: 'B',
      score: 10,
    },

    {
      title: 'عدد بعدی در الگوی 2، 4، 6، ؟ چیست؟',
      description: 'الگوهای عددی',
      subject: 'Math7',
      chapter: 'فصل 1 - راهبرد حل مسئله',
      difficulty: 2,
      optionA: '7',
      optionB: '9',
      optionC: '8',
      optionD: '10',
      correctAnswer: 'C',
      score: 10,
    },

    {
      title: 'عدد بعدی در الگوی 3، 6، 12، 24، ؟ چیست؟',
      description: 'الگوهای عددی',
      subject: 'Math7',
      chapter: 'فصل 1 - راهبرد حل مسئله',
      difficulty: 3,
      optionA: '36',
      optionB: '42',
      optionC: '48',
      optionD: '54',
      correctAnswer: 'C',
      score: 10,
    },

    {
      title: 'اگر عددی را 3 برابر کنیم و سپس 6 واحد اضافه کنیم، برای عدد 4 چه عددی به دست می‌آید؟',
      description: 'حل مسئله چندمرحله‌ای',
      subject: 'Math7',
      chapter: 'فصل 1 - راهبرد حل مسئله',
      difficulty: 3,
      optionA: '12',
      optionB: '18',
      optionC: '20',
      optionD: '24',
      correctAnswer: 'B',
      score: 10,
    },

    {
      title: 'اگر علی 3 مداد داشته باشد و 5 مداد دیگر بخرد، چند مداد دارد؟',
      description: 'مسئله جمع',
      subject: 'Math7',
      chapter: 'فصل 1 - راهبرد حل مسئله',
      difficulty: 1,
      optionA: '6',
      optionB: '7',
      optionC: '8',
      optionD: '9',
      correctAnswer: 'C',
      score: 10,
    },

    {
      title: 'یک کتاب 120 صفحه دارد. اگر دانش‌آموزی روزی 20 صفحه بخواند، چند روز طول می‌کشد؟',
      description: 'مسئله تقسیم',
      subject: 'Math7',
      chapter: 'فصل 1 - راهبرد حل مسئله',
      difficulty: 2,
      optionA: '4',
      optionB: '5',
      optionC: '6',
      optionD: '8',
      correctAnswer: 'C',
      score: 10,
    },

    {
      title: 'اگر مجموع دو عدد 30 و یکی از آن‌ها 12 باشد، عدد دیگر چیست؟',
      description: 'حل مسئله',
      subject: 'Math7',
      chapter: 'فصل 1 - راهبرد حل مسئله',
      difficulty: 2,
      optionA: '16',
      optionB: '18',
      optionC: '20',
      optionD: '22',
      correctAnswer: 'B',
      score: 10,
    },

    {
      title: 'یک عدد را دو برابر کرده و سپس 5 واحد کم می‌کنیم. اگر نتیجه 17 باشد، عدد اولیه چند است؟',
      description: 'مسئله معکوس',
      subject: 'Math7',
      chapter: 'فصل 1 - راهبرد حل مسئله',
      difficulty: 3,
      optionA: '9',
      optionB: '10',
      optionC: '11',
      optionD: '12',
      correctAnswer: 'C',
      score: 10,
    },

    // =====================================================
    // فصل 2 - عددهای صحیح
    // =====================================================

    {
      title: 'قرینه عدد 9- کدام است؟',
      description: 'اعداد صحیح',
      subject: 'Math7',
      chapter: 'فصل 2 - عددهای صحیح',
      difficulty: 1,
      optionA: '9',
      optionB: '-9',
      optionC: '0',
      optionD: '1',
      correctAnswer: 'A',
      score: 10,
    },

    {
      title: 'حاصل 5- + 8 چیست؟',
      description: 'جمع اعداد صحیح',
      subject: 'Math7',
      chapter: 'فصل 2 - عددهای صحیح',
      difficulty: 1,
      optionA: '13',
      optionB: '3',
      optionC: '-3',
      optionD: '-13',
      correctAnswer: 'B',
      score: 10,
    },

    {
      title: 'کدام عدد بزرگ‌تر است؟',
      description: 'مقایسه اعداد صحیح',
      subject: 'Math7',
      chapter: 'فصل 2 - عددهای صحیح',
      difficulty: 2,
      optionA: '-5',
      optionB: '-2',
      optionC: '-8',
      optionD: '-10',
      correctAnswer: 'B',
      score: 10,
    },

    {
      title: 'حاصل 7 - 12 چیست؟',
      description: 'تفریق اعداد صحیح',
      subject: 'Math7',
      chapter: 'فصل 2 - عددهای صحیح',
      difficulty: 1,
      optionA: '5',
      optionB: '-5',
      optionC: '19',
      optionD: '-19',
      correctAnswer: 'B',
      score: 10,
    },

    {
      title: 'حاصل 6- × 3 چیست؟',
      description: 'ضرب اعداد صحیح',
      subject: 'Math7',
      chapter: 'فصل 2 - عددهای صحیح',
      difficulty: 2,
      optionA: '18',
      optionB: '-18',
      optionC: '9',
      optionD: '-9',
      correctAnswer: 'B',
      score: 10,
    },

    {
      title: 'حاصل 24- ÷ 6 چیست؟',
      description: 'تقسیم اعداد صحیح',
      subject: 'Math7',
      chapter: 'فصل 2 - عددهای صحیح',
      difficulty: 2,
      optionA: '4',
      optionB: '-4',
      optionC: '6',
      optionD: '-6',
      correctAnswer: 'B',
      score: 10,
    },

    {
      title: 'حاصل 5- + 3 - 7 + 10 چیست؟',
      description: 'ترکیب عملیات اعداد صحیح',
      subject: 'Math7',
      chapter: 'فصل 2 - عددهای صحیح',
      difficulty: 3,
      optionA: '1',
      optionB: '-1',
      optionC: '3',
      optionD: '-3',
      correctAnswer: 'A',
      score: 10,
    },

    {
      title: 'حاصل 4- × 5 + 10 چیست؟',
      description: 'ترکیب ضرب و جمع',
      subject: 'Math7',
      chapter: 'فصل 2 - عددهای صحیح',
      difficulty: 3,
      optionA: '-30',
      optionB: '-10',
      optionC: '10',
      optionD: '30',
      correctAnswer: 'B',
      score: 10,
    },

    {
      title: 'اگر دمای هوا 3- درجه باشد و 8 درجه افزایش پیدا کند، دما چند درجه می‌شود؟',
      description: 'کاربرد اعداد صحیح',
      subject: 'Math7',
      chapter: 'فصل 2 - عددهای صحیح',
      difficulty: 2,
      optionA: '5',
      optionB: '-5',
      optionC: '11',
      optionD: '-11',
      correctAnswer: 'A',
      score: 10,
    },

    {
      title: 'حاصل عبارت 3- × (4 - 7) چیست؟',
      description: 'عملیات ترکیبی',
      subject: 'Math7',
      chapter: 'فصل 2 - عددهای صحیح',
      difficulty: 3,
      optionA: '-9',
      optionB: '9',
      optionC: '21',
      optionD: '-21',
      correctAnswer: 'B',
      score: 10,
    },

    // =====================================================
    // فصل 3 - جبر و معادله
    // =====================================================

    {
      title: 'اگر x + 3 = 10 باشد x چند است؟',
      description: 'معادله',
      subject: 'Math7',
      chapter: 'فصل 3 - جبر و معادله',
      difficulty: 1,
      optionA: '5',
      optionB: '6',
      optionC: '7',
      optionD: '8',
      correctAnswer: 'C',
      score: 10,
    },

    {
      title: 'عبارت 2x یعنی چه؟',
      description: 'عبارت جبری',
      subject: 'Math7',
      chapter: 'فصل 3 - جبر و معادله',
      difficulty: 1,
      optionA: 'x + x',
      optionB: 'x - 2',
      optionC: '2 + x',
      optionD: 'x ÷ 2',
      correctAnswer: 'A',
      score: 10,
    },

    {
      title: 'اگر 3x = 12 باشد مقدار x چند است؟',
      description: 'حل معادله',
      subject: 'Math7',
      chapter: 'فصل 3 - جبر و معادله',
      difficulty: 2,
      optionA: '2',
      optionB: '3',
      optionC: '4',
      optionD: '5',
      correctAnswer: 'C',
      score: 10,
    },

    {
      title: 'اگر x - 5 = 9 باشد مقدار x چند است؟',
      description: 'معادله یک‌مرحله‌ای',
      subject: 'Math7',
      chapter: 'فصل 3 - جبر و معادله',
      difficulty: 1,
      optionA: '4',
      optionB: '9',
      optionC: '14',
      optionD: '15',
      correctAnswer: 'C',
      score: 10,
    },

    {
      title: 'اگر 2x + 4 = 14 باشد x چند است؟',
      description: 'معادله',
      subject: 'Math7',
      chapter: 'فصل 3 - جبر و معادله',
      difficulty: 2,
      optionA: '4',
      optionB: '5',
      optionC: '6',
      optionD: '7',
      correctAnswer: 'B',
      score: 10,
    },

    {
      title: 'اگر 5x = 35 باشد x چند است؟',
      description: 'حل معادله',
      subject: 'Math7',
      chapter: 'فصل 3 - جبر و معادله',
      difficulty: 2,
      optionA: '5',
      optionB: '6',
      optionC: '7',
      optionD: '8',
      correctAnswer: 'C',
      score: 10,
    },

    {
      title: 'اگر 3x - 5 = 16 باشد x چند است؟',
      description: 'معادله چندمرحله‌ای',
      subject: 'Math7',
      chapter: 'فصل 3 - جبر و معادله',
      difficulty: 3,
      optionA: '6',
      optionB: '7',
      optionC: '8',
      optionD: '9',
      correctAnswer: 'B',
      score: 10,
    },

    {
      title: 'اگر 4x + 3 = 27 باشد x چند است؟',
      description: 'معادله چندمرحله‌ای',
      subject: 'Math7',
      chapter: 'فصل 3 - جبر و معادله',
      difficulty: 3,
      optionA: '5',
      optionB: '6',
      optionC: '7',
      optionD: '8',
      correctAnswer: 'B',
      score: 10,
    },

    {
      title: 'اگر 2(x + 3) = 18 باشد x چند است؟',
      description: 'پرانتز در معادله',
      subject: 'Math7',
      chapter: 'فصل 3 - جبر و معادله',
      difficulty: 3,
      optionA: '5',
      optionB: '6',
      optionC: '7',
      optionD: '8',
      correctAnswer: 'A',
      score: 10,
    },

    {
      title: 'اگر 5x - 10 = 2x + 8 باشد x چند است؟',
      description: 'معادله پیشرفته‌تر',
      subject: 'Math7',
      chapter: 'فصل 3 - جبر و معادله',
      difficulty: 3,
      optionA: '4',
      optionB: '5',
      optionC: '6',
      optionD: '7',
      correctAnswer: 'C',
      score: 10,
    },
  ];

  // =========================================
  // درج سوال‌ها
  // =========================================

  await prisma.question.createMany({
    data: questions,
  });

  // =========================================
  // گزارش Seed
  // =========================================

  const total = await prisma.question.count();

  const level1 = await prisma.question.count({
    where: {
      difficulty: 1,
    },
  });

  const level2 = await prisma.question.count({
    where: {
      difficulty: 2,
    },
  });

  const level3 = await prisma.question.count({
    where: {
      difficulty: 3,
    },
  });

  console.log('');
  console.log('======================================');
  console.log('MathVerse Question Bank Seeded');
  console.log('======================================');
  console.log(`Total Questions: ${total}`);
  console.log(`Difficulty 1: ${level1}`);
  console.log(`Difficulty 2: ${level2}`);
  console.log(`Difficulty 3: ${level3}`);
  console.log('======================================');
}

main()
  .catch((error) => {
  console.error('SEED ERROR:');
  console.error(error);
})