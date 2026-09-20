import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    await prisma.question.deleteMany();
    const questions = [
        {
            title: "حاصل 5 + 3 × 2 چیست؟",
            description: "اولویت عملگرها را رعایت کنید",
            subject: "Math",
            chapter: "راهبردهای حل مسئله",
            difficulty: 1,
            optionA: "16",
            optionB: "11",
            optionC: "13",
            optionD: "10",
            correctAnswer: "B",
            score: 10
        },
        {
            title: "عدد قرینه -7 کدام است؟",
            description: "اعداد صحیح",
            subject: "Math",
            chapter: "عددهای صحیح",
            difficulty: 1,
            optionA: "7",
            optionB: "-7",
            optionC: "0",
            optionD: "14",
            correctAnswer: "A",
            score: 10
        },
        {
            title: "اگر x+5=12 باشد مقدار x چند است؟",
            description: "حل معادله",
            subject: "Math",
            chapter: "جبر و معادله",
            difficulty: 2,
            optionA: "5",
            optionB: "6",
            optionC: "7",
            optionD: "8",
            correctAnswer: "C",
            score: 10
        },
        {
            title: "محیط مربع با ضلع 4 چند است؟",
            description: "هندسه",
            subject: "Math",
            chapter: "هندسه",
            difficulty: 1,
            optionA: "8",
            optionB: "12",
            optionC: "16",
            optionD: "20",
            correctAnswer: "C",
            score: 10
        },
        {
            title: "مساحت مستطیل 5 در 3 چند است؟",
            description: "محاسبه مساحت",
            subject: "Math",
            chapter: "هندسه",
            difficulty: 1,
            optionA: "8",
            optionB: "15",
            optionC: "20",
            optionD: "25",
            correctAnswer: "B",
            score: 10
        },
        {
            title: "جذر عدد 81 چند است؟",
            description: "توان و جذر",
            subject: "Math",
            chapter: "توان و جذر",
            difficulty: 2,
            optionA: "7",
            optionB: "8",
            optionC: "9",
            optionD: "10",
            correctAnswer: "C",
            score: 10
        },
        {
            title: "حاصل 2 به توان 3 چیست؟",
            description: "توان",
            subject: "Math",
            chapter: "توان و جذر",
            difficulty: 2,
            optionA: "6",
            optionB: "8",
            optionC: "9",
            optionD: "12",
            correctAnswer: "B",
            score: 10
        },
        {
            title: "کدام عدد اول است؟",
            description: "اعداد اول",
            subject: "Math",
            chapter: "شمارنده‌ها",
            difficulty: 1,
            optionA: "9",
            optionB: "12",
            optionC: "13",
            optionD: "15",
            correctAnswer: "C",
            score: 10
        }
    ];
    await prisma.question.createMany({
        data: questions
    });
    console.log("Math Grade 7 Question Bank Seeded");
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(() => {
    prisma.$disconnect();
});
