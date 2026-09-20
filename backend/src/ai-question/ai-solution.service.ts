import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiSolutionService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // =========================================================
  // GET /ai-question/solution/:id
  // =========================================================

  async getSolution(questionId: number) {
    if (
      !Number.isInteger(questionId) ||
      questionId <= 0
    ) {
      throw new BadRequestException(
        'شناسه سوال معتبر نیست.',
      );
    }

    const question =
      await this.prisma.question.findUnique({
        where: {
          id: questionId,
        },
      });

    if (!question) {
      throw new NotFoundException(
        'Question not found',
      );
    }

    const solution =
      this.generateMathSolution(question);

    // فقط solution را به‌روزرسانی می‌کنیم.
    await this.prisma.question.update({
  where: {
    id: questionId,
  },
  data: {
    solution,
    explanation: solution,
  },
});

    return {
      questionId: question.id,
      question: question.title,

      options: {
        A: question.optionA,
        B: question.optionB,
        C: question.optionC,
        D: question.optionD,
      },

      correctAnswer:
        question.correctAnswer,

      solution,
    };
  }

  // =========================================================
  // POST /ai-question/solution/:id
  // =========================================================

  async generateSolution(id: number) {
    return this.getSolution(id);
  }

  // =========================================================
  // موتور اصلی Solution
  // =========================================================

  private generateMathSolution(
    question: any,
  ): string {
    const title =
      this.normalizeText(
        question.title ?? '',
      );

    const correctAnswer =
      this.normalizeText(
        question.correctAnswer ?? '',
      ).toUpperCase();

    const optionA =
      question.optionA ?? '';

    const optionB =
      question.optionB ?? '';

    const optionC =
      question.optionC ?? '';

    const optionD =
      question.optionD ?? '';

    const header = `
🤖 راه‌حل آموزشی MathVerse

📌 سوال:
${question.title}

`;

    // =====================================================
    // 1. معادلات دارای پرانتز
    // =====================================================

    const bracketEquation =
      this.solveParenthesesEquation(
        title,
        correctAnswer,
      );

    if (bracketEquation) {
      return header + bracketEquation;
    }

    // =====================================================
    // 2. مسائل معکوس
    // =====================================================

    const reverse =
      this.solveReverseProblem(
        title,
        correctAnswer,
      );

    if (reverse) {
      return header + reverse;
    }

    // =====================================================
    // 3. معادله دو طرفه
    // =====================================================

    const twoSide =
      this.solveTwoSideEquation(
        title,
        correctAnswer,
      );

    if (twoSide) {
      return header + twoSide;
    }
    // =====================================================
// 4. معادله خطی چندمرحله‌ای
//
// 4x + 3 = 27
// 5x - 10 = 20
// 3x + 7 = 19
// =====================================================
const linearEquation =
  this.solveLinearEquation(
    title,
    correctAnswer,
  );

if (linearEquation) {
  return header + linearEquation;
}

    // =====================================================
    // 4. معادله یک مرحله‌ای
    // =====================================================

    const oneStep =
      this.solveOneStepEquation(
        title,
        correctAnswer,
      );

    if (oneStep) {
      return header + oneStep;
    }

    // =====================================================
    // 5. عبارت ریاضی
    // =====================================================

    const arithmetic =
      this.solveArithmetic(
        title,
        correctAnswer,
      );

    if (arithmetic) {
      return header + arithmetic;
    }

    // =====================================================
    // 6. الگوی عددی
    // =====================================================

    const sequence =
      this.solveSequence(
        title,
        correctAnswer,
      );

    if (sequence) {
      return header + sequence;
    }

    // =====================================================
    // 7. قرینه
    // =====================================================

    const opposite =
      this.solveOpposite(
        title,
        correctAnswer,
      );

    if (opposite) {
      return header + opposite;
    }

    // =====================================================
    // 8. مسئله جمع
    // =====================================================

    const addition =
      this.solveSimpleAddition(
        title,
        correctAnswer,
      );

    if (addition) {
      return header + addition;
    }

    // =====================================================
    // 9. مسئله تقسیم
    // =====================================================

    const division =
      this.solveSimpleDivision(
        title,
        correctAnswer,
      );

    if (division) {
      return header + division;
    }

    // =====================================================
    // 10. حل مسئله مفهومی
    // =====================================================

    if (
      title.includes('حل مسئله') ||
      title.includes('حل یک مسئله')
    ) {
      return (
        header +
        `
📚 روش حل مسئله

📝 مرحله ۱

صورت مسئله را با دقت می‌خوانیم و مشخص می‌کنیم سؤال چه چیزی می‌خواهد.

📝 مرحله ۲

اطلاعات مهم مسئله را جدا می‌کنیم.

📝 مرحله ۳

عملیات یا رابطه ریاضی مناسب را انتخاب می‌کنیم.

📝 مرحله ۴

محاسبات را انجام می‌دهیم.

📝 مرحله ۵

جواب را با صورت سؤال و گزینه‌ها بررسی می‌کنیم.

━━━━━━━━━━━━

✅ پاسخ نهایی

گزینه ${correctAnswer}

${this.getOptionText(
  correctAnswer,
  optionA,
  optionB,
  optionC,
  optionD,
)}

💡 نکته آموزشی

در حل مسئله ابتدا باید مشخص کنیم سؤال دقیقاً چه چیزی می‌خواهد و سپس عملیات مناسب را انتخاب کنیم.
`
      );
    }

    // =====================================================
    // 11. fallback
    // =====================================================

    return (
      header +
      `
📚 بررسی سؤال

ساختار این سؤال هنوز در موتور حل خودکار MathVerse شناسایی نشده است.

برای جلوگیری از ارائه راه‌حل اشتباه، محاسبات حدس زده نمی‌شود.

━━━━━━━━━━━━

✅ پاسخ نهایی

گزینه ${correctAnswer}

${this.getOptionText(
  correctAnswer,
  optionA,
  optionB,
  optionC,
  optionD,
)}

💡 نکته

راه‌حل دقیق باید بر اساس ساختار واقعی سؤال تولید شود.
`
    );
  }

  // =========================================================
  // معادلات دارای پرانتز
  //
  // 2(x + 3) = 18
  // 3(x - 2) = 15
  // 2(x + 4) = x + 12
  // =========================================================

  private solveParenthesesEquation(
    title: string,
    correctAnswer: string,
  ): string | null {
    const normalized =
      this.normalizeText(title)
        .replace(/[؟?]/g, '')
        .replace(/×/g, '*')
        .replace(/−/g, '-')
        .replace(/\s+/g, ' ')
        .trim();

    /*
     * حالت:
     * 2(x + 3) = 18
     * 3(x - 2) = 15
     */

    const simpleMatch =
      normalized.match(
        /(-?\d+)\s*\(\s*x\s*([+-])\s*(\d+)\s*\)\s*=\s*(-?\d+(?:\s*x\s*[+-]\s*\d+)?)\s*/i,
      );

    if (!simpleMatch) {
      return null;
    }

    const multiplier =
      Number(simpleMatch[1]);

    const operator =
      simpleMatch[2];

    const insideNumber =
      Number(simpleMatch[3]);

    const rightSide =
      simpleMatch[4]
        .replace(/\s+/g, '');

    if (
      !Number.isFinite(multiplier) ||
      multiplier === 0
    ) {
      return null;
    }

    const leftConstant =
      operator === '+'
        ? multiplier * insideNumber
        : -multiplier * insideNumber;

    const leftCoefficient =
      multiplier;

    // =====================================================
    // RHS را به شکل cx + d تبدیل می‌کنیم
    // =====================================================

    let rightCoefficient = 0;
    let rightConstant = 0;

    const rightXMatch =
      rightSide.match(
        /^(-?\d+)x(?:([+-])(\d+))?$/i,
      );

    if (rightXMatch) {
      rightCoefficient =
        Number(rightXMatch[1]);

      if (rightXMatch[2]) {
        rightConstant =
          rightXMatch[2] === '+'
            ? Number(rightXMatch[3])
            : -Number(rightXMatch[3]);
      }
    } else if (
      /^-?\d+$/.test(rightSide)
    ) {
      rightCoefficient = 0;
      rightConstant =
        Number(rightSide);
    } else {
      return null;
    }

    const xCoefficient =
      leftCoefficient -
      rightCoefficient;

    const constant =
      rightConstant -
      leftConstant;

    if (xCoefficient === 0) {
      return null;
    }

    const x =
      constant /
      xCoefficient;

    if (!Number.isFinite(x)) {
      return null;
    }

    const leftExpanded =
      `${leftCoefficient}x ${
        leftConstant >= 0
          ? '+'
          : '-'
      } ${Math.abs(leftConstant)}`;

    let rightExpanded =
      '';

    if (
      rightCoefficient === 0
    ) {
      rightExpanded =
        this.formatNumber(
          rightConstant,
        );
    } else {
      rightExpanded =
        `${rightCoefficient}x ${
          rightConstant >= 0
            ? '+'
            : '-'
        } ${Math.abs(rightConstant)}`;
    }

    const removeLeftText =
      leftConstant >= 0
        ? `${leftConstant} را از دو طرف کم می‌کنیم`
        : `${Math.abs(leftConstant)} را به دو طرف اضافه می‌کنیم`;

    return `
🧮 حل معادله دارای پرانتز

📌 معادله:

${normalized}

📝 مرحله ۱

ابتدا پرانتز را باز می‌کنیم:

${leftExpanded} = ${rightExpanded}

📝 مرحله ۲

جمله‌های دارای x را در یک طرف قرار می‌دهیم:

${xCoefficient}x = ${constant}

📝 مرحله ۳

برای تنها کردن x، دو طرف را بر ${xCoefficient} تقسیم می‌کنیم:

x = ${constant} ÷ ${xCoefficient}

📝 مرحله ۴

حساب می‌کنیم:

x = ${this.formatNumber(x)}

━━━━━━━━━━━━

✅ پاسخ نهایی

x = ${this.formatNumber(x)}

گزینه صحیح:

${correctAnswer}

💡 نکته آموزشی

در معادلات دارای پرانتز، ابتدا پرانتز را باز می‌کنیم، سپس جمله‌های دارای x و عددهای ثابت را جدا می‌کنیم.

🔎 ${removeLeftText}.
`;
  }

  // =========================================================
  // معادله دو طرفه
  //
  // 5x - 10 = 2x + 8
  // =========================================================

  private solveTwoSideEquation(
    title: string,
    correctAnswer: string,
  ): string | null {
    const normalized =
      this.normalizeText(title)
        .replace(/[؟?]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const match =
      normalized.match(
        /(?:^|\s)(-?\d+)x\s*([+-])\s*(\d+)\s*=\s*(-?\d+)x\s*([+-])\s*(\d+)/i,
      );

    if (!match) {
      return null;
    }

    const a =
      Number(match[1]);

    const leftConstant =
      Number(match[3]) *
      (match[2] === '-' ? -1 : 1);

    const c =
      Number(match[4]);

    const rightConstant =
      Number(match[6]) *
      (match[5] === '-' ? -1 : 1);

    const xCoefficient =
      a - c;

    const constant =
      rightConstant -
      leftConstant;

    if (
      xCoefficient === 0
    ) {
      return null;
    }

    const x =
      constant /
      xCoefficient;

    if (!Number.isFinite(x)) {
      return null;
    }

    return `
🧮 حل معادله

${normalized}

📝 مرحله ۱

جمله‌های دارای x را در یک طرف قرار می‌دهیم:

${a}x - ${c}x = ${rightConstant} - (${leftConstant})

📝 مرحله ۲

ضریب x را محاسبه می‌کنیم:

${xCoefficient}x = ${constant}

📝 مرحله ۳

دو طرف را بر ${xCoefficient} تقسیم می‌کنیم:

x = ${constant} ÷ ${xCoefficient}

📝 مرحله ۴

حساب می‌کنیم:

x = ${this.formatNumber(x)}

━━━━━━━━━━━━

✅ پاسخ نهایی

x = ${this.formatNumber(x)}

گزینه صحیح:

${correctAnswer}

💡 نکته آموزشی

هدف در حل معادله این است که x را تنها در یک طرف مساوی قرار دهیم.
`;
  }

  // =========================================================
  // معادله یک مرحله‌ای
  //
  // x + 3 = 10
  // x - 5 = 9
  // 2x = 14
  // =========================================================
// =========================================================
// معادله خطی چندمرحله‌ای
//
// نمونه‌ها:
//
// 4x + 3 = 27
// 5x - 10 = 20
// 3x + 7 = 19
// 7x - 4 = 24
// =========================================================

private solveLinearEquation(
  title: string,
  correctAnswer: string,
): string | null {

  const normalized =
    this.normalizeText(title)
      .replace(/[؟?]/g, "")
      .replace(/−/g, "-")
      .replace(/\s+/g, " ")
      .trim();

  const match =
    normalized.match(
      /^(-?\d+)x\s*([+-])\s*(\d+)\s*=\s*(-?\d+)$/i,
    );

  if (!match) {
    return null;
  }

  const coefficient =
    Number(match[1]);

  const operator =
    match[2];

  const amount =
    Number(match[3]);

  const result =
    Number(match[4]);

  if (
    !Number.isFinite(coefficient) ||
    coefficient === 0 ||
    !Number.isFinite(amount) ||
    !Number.isFinite(result)
  ) {
    return null;
  }

  const constant =
    operator === "+"
      ? amount
      : -amount;

  const xNumerator =
    result - constant;

  const x =
    xNumerator / coefficient;

  if (!Number.isFinite(x)) {
    return null;
  }

  const firstStep =
    operator === "+"
      ? `${coefficient}x = ${result} - ${amount}`
      : `${coefficient}x = ${result} + ${amount}`;

  return `
🧮 حل معادله خطی

📌 معادله:

${normalized}

📝 مرحله ۱

عدد ثابت را به طرف دیگر مساوی منتقل می‌کنیم.

${
  operator === "+"
    ? `چون ${amount} به x اضافه شده است، ${amount} را از دو طرف کم می‌کنیم:`
    : `چون ${amount} از x کم شده است، ${amount} را به دو طرف اضافه می‌کنیم:`
}

${firstStep}

📝 مرحله ۲

حساب می‌کنیم:

${coefficient}x = ${xNumerator}

📝 مرحله ۳

برای تنها کردن x، دو طرف را بر ${coefficient} تقسیم می‌کنیم:

x = ${xNumerator} ÷ ${coefficient}

📝 مرحله ۴

حساب می‌کنیم:

x = ${this.formatNumber(x)}

━━━━━━━━━━━━

✅ پاسخ نهایی

x = ${this.formatNumber(x)}

گزینه صحیح:

${correctAnswer}

💡 نکته آموزشی

در معادلات خطی، ابتدا عدد ثابت را با استفاده از عمل معکوس حذف می‌کنیم و سپس ضریب x را با تقسیم حذف می‌کنیم.
`;
}
  private solveOneStepEquation(
    title: string,
    correctAnswer: string,
  ): string | null {
    const normalized =
      this.normalizeText(title)
        .replace(/[؟?]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // =====================================================
    // x - 5 = 9
    // x + 7 = 15
    // =====================================================

    const xPlusMinus =
      normalized.match(
        /(?:^|\s)x\s*([+-])\s*(\d+)\s*=\s*(-?\d+)/i,
      );

    if (xPlusMinus) {
      const operator =
        xPlusMinus[1];

      const amount =
        Number(xPlusMinus[2]);

      const result =
        Number(xPlusMinus[3]);

      const x =
        operator === '+'
          ? result - amount
          : result + amount;

      if (!Number.isFinite(x)) {
        return null;
      }

      return `
🧮 حل معادله یک‌مرحله‌ای

📌 صورت سؤال:

x ${operator} ${amount} = ${result}

📝 مرحله ۱

از عمل معکوس استفاده می‌کنیم.

${operator === '-'
  ? `چون ${amount} از x کم شده است، ${amount} را به دو طرف اضافه می‌کنیم:`
  : `چون ${amount} به x اضافه شده است، ${amount} را از دو طرف کم می‌کنیم:`
}

${operator === '-'
  ? `x = ${result} + ${amount}`
  : `x = ${result} - ${amount}`}

📝 مرحله ۲

حساب می‌کنیم:

x = ${this.formatNumber(x)}

━━━━━━━━━━━━

✅ پاسخ نهایی

x = ${this.formatNumber(x)}

گزینه صحیح:

${correctAnswer}

💡 نکته آموزشی

برای حل معادله از عمل معکوس استفاده می‌کنیم تا x تنها بماند.
`;
    }

    // =====================================================
    // 2x = 20
    // =====================================================

    const multiplication =
      normalized.match(
        /(?:^|\s)(-?\d+)\s*x\s*=\s*(-?\d+)/i,
      );

    if (multiplication) {
      const coefficient =
        Number(multiplication[1]);

      const result =
        Number(multiplication[2]);

      if (
        coefficient === 0
      ) {
        return null;
      }

      const x =
        result /
        coefficient;

      if (!Number.isFinite(x)) {
        return null;
      }

      return `
🧮 حل معادله یک‌مرحله‌ای

📌 صورت سؤال:

${coefficient}x = ${result}

📝 مرحله ۱

برای تنها کردن x، دو طرف را بر ${coefficient} تقسیم می‌کنیم:

x = ${result} ÷ ${coefficient}

📝 مرحله ۲

حساب می‌کنیم:

x = ${this.formatNumber(x)}

━━━━━━━━━━━━

✅ پاسخ نهایی

x = ${this.formatNumber(x)}

گزینه صحیح:

${correctAnswer}

💡 نکته آموزشی

وقتی x در یک عدد ضرب شده است، برای پیدا کردن x از تقسیم استفاده می‌کنیم.
`;
    }

    return null;
  }

  // =========================================================
  // مسائل معکوس
  // =========================================================

  private solveReverseProblem(
    title: string,
    correctAnswer: string,
  ): string | null {
    const normalized =
      this.normalizeText(title);

    let multiplier:
      number | null = null;

    if (
      normalized.includes('دو برابر') ||
      normalized.includes('2 برابر')
    ) {
      multiplier = 2;
    } else if (
      normalized.includes('سه برابر') ||
      normalized.includes('3 برابر')
    ) {
      multiplier = 3;
    } else if (
      normalized.includes('چهار برابر') ||
      normalized.includes('4 برابر')
    ) {
      multiplier = 4;
    }

    if (multiplier === null) {
      return null;
    }

    const numbers =
      this.extractNumbers(normalized);

    if (numbers.length < 2) {
      return null;
    }

    let operation:
      | 'subtract'
      | 'add' = 'subtract';

    let amount = 0;

    const result =
      numbers[numbers.length - 1];

    const subtractMatch =
      normalized.match(
        /(?:سپس|بعد|و سپس|و بعد)?\s*(?:عدد\s*)?(\d+)\s*(?:واحد)?\s*(?:کم|منها)/i,
      );

    if (subtractMatch) {
      operation = 'subtract';
      amount =
        Number(subtractMatch[1]);
    }

    const addMatch =
      normalized.match(
        /(?:سپس|بعد|و سپس|و بعد)?\s*(?:عدد\s*)?(\d+)\s*(?:واحد)?\s*(?:اضافه|افزوده)/i,
      );

    if (addMatch) {
      operation = 'add';
      amount =
        Number(addMatch[1]);
    }

    if (amount === 0) {
      amount =
        numbers[numbers.length - 2];
    }

    if (
      !Number.isFinite(amount) ||
      !Number.isFinite(result)
    ) {
      return null;
    }

    let x: number;
    let restored: number;

    if (
      operation === 'subtract'
    ) {
      restored =
        result + amount;

      x =
        restored /
        multiplier;
    } else {
      restored =
        result - amount;

      x =
        restored /
        multiplier;
    }

    if (!Number.isFinite(x)) {
      return null;
    }

    const equation =
      operation === 'subtract'
        ? `${multiplier}x - ${amount} = ${result}`
        : `${multiplier}x + ${amount} = ${result}`;

    return `
🧮 حل مسئله معکوس

📝 مرحله ۱

عدد اولیه را x در نظر می‌گیریم.

📝 مرحله ۲

عدد اولیه را ${multiplier} برابر می‌کنیم:

${multiplier}x

📝 مرحله ۳

طبق صورت سؤال:

${equation}

📝 مرحله ۴

عمل معکوس انجام می‌دهیم:

${operation === 'subtract'
  ? `${multiplier}x = ${result} + ${amount}`
  : `${multiplier}x = ${result} - ${amount}`}

${multiplier}x = ${restored}

📝 مرحله ۵

دو طرف را بر ${multiplier} تقسیم می‌کنیم:

x = ${restored} ÷ ${multiplier}

📝 مرحله ۶

حساب می‌کنیم:

x = ${this.formatNumber(x)}

━━━━━━━━━━━━

✅ پاسخ نهایی

عدد اولیه = ${this.formatNumber(x)}

گزینه صحیح:

${correctAnswer}

💡 نکته آموزشی

در مسائل معکوس، عملیات انجام‌شده روی عدد را به ترتیب معکوس برمی‌گردانیم.
`;
  }

  // =========================================================
  // عبارت‌های ریاضی
  // =========================================================

  private solveArithmetic(
    title: string,
    correctAnswer: string,
  ): string | null {
    let normalized =
      this.normalizeText(title)
        .replace(/[؟?]/g, '')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/\s+/g, ' ')
        .trim();

    /*
     * در فارسی ممکن است عدد منفی این‌طور نوشته شود:
     *
     * 3- × (4 - 7)
     *
     * یعنی:
     *
     * -3 × (4 - 7)
     */

    normalized =
  normalized
    // 3- × ...
    .replace(
      /(\d+)\s*-\s*\*/g,
      '-$1 *',
    )
    // 5- + ...
    .replace(
      /(\d+)\s*-\s*\+/g,
      '-$1 +',
    )
    // 5- - ...
    .replace(
      /(\d+)\s*-\s*-/g,
      '-$1 -',
    );

    /*
     * عبارت دارای پرانتز
     */

    const expressionMatch =
      normalized.match(
        /((?:-?\d+(?:\.\d+)?|\([^()]+\))(?:\s*[+\-*/]\s*(?:-?\d+(?:\.\d+)?|\([^()]+\)))*)/i,
      );

    if (!expressionMatch) {
      return null;
    }

    let expression =
      expressionMatch[1]
        .replace(/\s+/g, '');

    // باید حداقل یک عملیات ریاضی داشته باشد
    if (
      !/[+\-*/()]/.test(expression)
    ) {
      return null;
    }

    const result =
      this.calculateArithmetic(
        expression,
      );

    if (result === null) {
      return null;
    }

    const displayExpression =
      expression
        .replace(/\*/g, ' × ')
        .replace(/\//g, ' ÷ ');

    let steps = '';

    /*
     * پرانتز
     */

    const bracketMatch =
      expression.match(
        /\((-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)\)/,
      );

    if (bracketMatch) {
      const a =
        Number(bracketMatch[1]);

      const operator =
        bracketMatch[2];

      const b =
        Number(bracketMatch[3]);

      let bracketResult: number;

      if (operator === '+') {
        bracketResult = a + b;
      } else if (operator === '-') {
        bracketResult = a - b;
      } else if (operator === '*') {
        bracketResult = a * b;
      } else {
        if (b === 0) {
          return null;
        }

        bracketResult = a / b;
      }

      const replaced =
        expression.replace(
          bracketMatch[0],
          this.formatNumber(
            bracketResult,
          ),
        );

      steps += `
📝 مرحله ۱

ابتدا داخل پرانتز را حساب می‌کنیم:

${a} ${operator} ${b} = ${this.formatNumber(bracketResult)}

پس:

${replaced}

`;
    }

    /*
     * ضرب و تقسیم
     */

    const priority =
      this.findPriorityOperation(
        expression,
      );

    if (priority) {
      steps += `
📝 مرحله ۲

ابتدا ضرب یا تقسیم را انجام می‌دهیم:

${priority.left} ${
        priority.operator === '*'
          ? '×'
          : '÷'
      } ${priority.right} = ${this.formatNumber(
        priority.priorityResult,
      )}

`;
    }

    steps += `
📝 مرحله ${bracketMatch ? '۳' : '۱'}

سپس جمع و تفریق را انجام می‌دهیم و جواب نهایی را به دست می‌آوریم:

${displayExpression} = ${this.formatNumber(result)}

`;

    return `
🧮 حل عبارت ریاضی

📌 عبارت:

${displayExpression}

${steps}

━━━━━━━━━━━━

✅ پاسخ نهایی

${this.formatNumber(result)}

گزینه صحیح:

${correctAnswer}

💡 نکته آموزشی

در عبارت‌های ریاضی، ابتدا پرانتز، سپس ضرب و تقسیم و در پایان جمع و تفریق را انجام می‌دهیم.
`;
  }

  // =========================================================
  // پیدا کردن ضرب یا تقسیم
  // =========================================================

  private findPriorityOperation(
    expression: string,
  ): {
    left: number;
    operator: string;
    right: number;
    priorityResult: number;
  } | null {
    const match =
      expression.match(
        /(-?\d+(?:\.\d+)?)([*\/])(-?\d+(?:\.\d+)?)/,
      );

    if (!match) {
      return null;
    }

    const left =
      Number(match[1]);

    const operator =
      match[2];

    const right =
      Number(match[3]);

    if (
      operator === '/' &&
      right === 0
    ) {
      return null;
    }

    const priorityResult =
      operator === '*'
        ? left * right
        : left / right;

    if (
      !Number.isFinite(
        priorityResult,
      )
    ) {
      return null;
    }

    return {
      left,
      operator,
      right,
      priorityResult,
    };
  }

  // =========================================================
  // محاسبه امن عبارت ریاضی
  //
  // پشتیبانی:
  // 8+4*2
  // -3*(4-7)
  // (4-7)
  // 10/2
  // =========================================================

  private calculateArithmetic(
    expression: string,
  ): number | null {
    try {
      let index = 0;

      const skipSpaces = () => {
        while (
          index < expression.length &&
          /\s/.test(
            expression[index],
          )
        ) {
          index++;
        }
      };

      const parseNumber =
        (): number | null => {
          skipSpaces();

          const start =
            index;

          if (
            expression[index] === '+' ||
            expression[index] === '-'
          ) {
            index++;
          }

          while (
            index < expression.length &&
            /[\d.]/.test(
              expression[index],
            )
          ) {
            index++;
          }

          if (
            start === index
          ) {
            return null;
          }

          const value =
            Number(
              expression.slice(
                start,
                index,
              ),
            );

          return Number.isFinite(
            value,
          )
            ? value
            : null;
        };

      const parseFactor =
        (): number | null => {
          skipSpaces();

          if (
            expression[index] === '('
          ) {
            index++;

            const value =
              parseExpression();

            skipSpaces();

            if (
              expression[index] !== ')'
            ) {
              return null;
            }

            index++;

            return value;
          }

          return parseNumber();
        };

      const parseTerm =
        (): number | null => {
          let value =
            parseFactor();

          if (value === null) {
            return null;
          }

          while (true) {
            skipSpaces();

            const operator =
              expression[index];

            if (
              operator !== '*' &&
              operator !== '/'
            ) {
              break;
            }

            index++;

            const right =
              parseFactor();

            if (right === null) {
              return null;
            }

            if (
              operator === '/' &&
              right === 0
            ) {
              return null;
            }

            value =
              operator === '*'
                ? value * right
                : value / right;
          }

          return value;
        };

      function parseExpression():
        number | null {
        let value =
          parseTerm();

        if (value === null) {
          return null;
        }

        while (true) {
          skipSpaces();

          const operator =
            expression[index];

          if (
            operator !== '+' &&
            operator !== '-'
          ) {
            break;
          }

          index++;

          const right =
            parseTerm();

          if (right === null) {
            return null;
          }

          value =
            operator === '+'
              ? value + right
              : value - right;
        }

        return value;
      }

      const result =
        parseExpression();

      skipSpaces();

      if (
        result === null ||
        index !== expression.length
      ) {
        return null;
      }

      return Number.isFinite(result)
        ? result
        : null;
    } catch {
      return null;
    }
  }

  // =========================================================
  // الگوی عددی
  // =========================================================

  private solveSequence(
    title: string,
    correctAnswer: string,
  ): string | null {
    if (
      !title.includes('الگو')
    ) {
      return null;
    }

    const numbers =
      this.extractNumbers(title);

    if (numbers.length < 2) {
      return null;
    }

    const differences: number[] =
      [];

    for (
      let i = 1;
      i < numbers.length;
      i++
    ) {
      differences.push(
        numbers[i] -
          numbers[i - 1],
      );
    }

    const sameDifference =
      differences.every(
        (difference) =>
          difference ===
          differences[0],
      );

    if (!sameDifference) {
      return null;
    }

    const difference =
      differences[0];

    const last =
      numbers[
        numbers.length - 1
      ];

    const next =
      last + difference;

    return `
🔢 حل الگوی عددی

📝 مرحله ۱

اعداد داده‌شده:

${numbers.join(' ، ')}

📝 مرحله ۲

اختلاف بین اعداد:

${differences.join(' ، ')}

📝 مرحله ۳

در هر مرحله ${
      difference >= 0
        ? `${difference} واحد اضافه می‌شود`
        : `${Math.abs(difference)} واحد کم می‌شود`
    }.

📝 مرحله ۴

عدد بعدی:

${last} ${
      difference >= 0
        ? '+'
        : '-'
    } ${Math.abs(difference)} = ${next}

━━━━━━━━━━━━

✅ پاسخ نهایی

${next}

گزینه صحیح:

${correctAnswer}

💡 نکته آموزشی

برای حل الگوی عددی، رابطه بین اعداد پشت سر هم را پیدا می‌کنیم.
`;
  }

  // =========================================================
  // قرینه
  // =========================================================

  private solveOpposite(
    title: string,
    correctAnswer: string,
  ): string | null {
    if (
      !title.includes('قرینه')
    ) {
      return null;
    }

    const normalized =
      this.normalizeText(title);

    const numbers =
      this.extractNumbers(
        normalized,
      );

    if (numbers.length === 0) {
      return null;
    }

    let number =
      numbers[0];

    if (
      normalized.includes(
        `${Math.abs(number)}-`,
      )
    ) {
      number =
        -Math.abs(number);
    }

    const opposite =
      -number;

    return `
🔄 حل قرینه

📝 مرحله ۱

عدد اصلی:

${number}

📝 مرحله ۲

قرینه هر عدد، همان عدد با علامت مخالف است:

${number} → ${opposite}

📝 مرحله ۳

پس:

قرینه = ${opposite}

━━━━━━━━━━━━

✅ پاسخ نهایی

${opposite}

گزینه صحیح:

${correctAnswer}

💡 نکته آموزشی

برای پیدا کردن قرینه یک عدد، علامت آن را تغییر می‌دهیم.
`;
  }

  // =========================================================
  // مسئله جمع
  // =========================================================

  private solveSimpleAddition(
    title: string,
    correctAnswer: string,
  ): string | null {
    if (
      !title.includes('مداد') ||
      !(
        title.includes('بخرد') ||
        title.includes('خرد') ||
        title.includes('دیگر')
      )
    ) {
      return null;
    }

    const numbers =
      this.extractNumbers(title);

    if (numbers.length < 2) {
      return null;
    }

    const a =
      numbers[0];

    const b =
      numbers[1];

    const result =
      a + b;

    return `
➕ حل مسئله جمع

📝 مرحله ۱

مقدار اولیه:

${a} مداد

📝 مرحله ۲

مدادهای اضافه‌شده:

${b} مداد

📝 مرحله ۳

از جمع استفاده می‌کنیم:

${a} + ${b} = ${result}

━━━━━━━━━━━━

✅ پاسخ نهایی

${result} مداد

گزینه صحیح:

${correctAnswer}

💡 نکته آموزشی

وقتی چیزی به مقدار موجود اضافه می‌شود، از جمع استفاده می‌کنیم.
`;
  }

  // =========================================================
  // مسئله تقسیم
  // =========================================================

  private solveSimpleDivision(
    title: string,
    correctAnswer: string,
  ): string | null {
    const normalized =
      this.normalizeText(title);

    if (
      !(
        normalized.includes('روزی') ||
        normalized.includes('هر روز') ||
        normalized.includes('هرروز')
      )
    ) {
      return null;
    }

    const numbers =
      this.extractNumbers(
        normalized,
      );

    if (numbers.length < 2) {
      return null;
    }

    const total =
      numbers[0];

    const perDay =
      numbers[1];

    if (
      perDay === 0
    ) {
      return null;
    }

    const result =
      total / perDay;

    if (
      !Number.isFinite(result)
    ) {
      return null;
    }

    return `
➗ حل مسئله تقسیم

📝 مرحله ۱

کل مقدار:

${total}

📝 مرحله ۲

مقدار انجام‌شده در هر روز:

${perDay}

📝 مرحله ۳

برای پیدا کردن تعداد روزها:

${total} ÷ ${perDay} = ${this.formatNumber(result)}

━━━━━━━━━━━━

✅ پاسخ نهایی

${this.formatNumber(result)} روز

گزینه صحیح:

${correctAnswer}

💡 نکته آموزشی

برای پیدا کردن تعداد دفعات یا تعداد روزها، مقدار کل را بر مقدار هر بار تقسیم می‌کنیم.
`;
  }

  // =========================================================
  // استخراج اعداد
  // =========================================================

  private extractNumbers(
    text: string,
  ): number[] {
    const normalized =
      this.normalizePersianNumbers(
        text,
      );

    const matches =
      normalized.match(
        /-?\d+(?:\.\d+)?/g,
      );

    if (!matches) {
      return [];
    }

    return matches.map(Number);
  }

  // =========================================================
  // تبدیل اعداد فارسی / عربی
  // =========================================================

  private normalizePersianNumbers(
    text: string,
  ): string {
    return text
      .replace(
        /[۰-۹]/g,
        (digit) =>
          String(
            '۰۱۲۳۴۵۶۷۸۹'.indexOf(
              digit,
            ),
          ),
      )
      .replace(
        /[٠-٩]/g,
        (digit) =>
          String(
            '٠١٢٣٤٥٦٧٨٩'.indexOf(
              digit,
            ),
          ),
      );
  }

  // =========================================================
  // نرمال‌سازی متن
  // =========================================================

  private normalizeText(
    text: string,
  ): string {
    return this.normalizePersianNumbers(
      text
        .trim()
        .replace(/ي/g, 'ی')
        .replace(/ك/g, 'ک')
        .replace(/‌/g, ' '),
    );
  }

  // =========================================================
  // فرمت عدد
  // =========================================================

  private formatNumber(
    value: number,
  ): string {
    if (
      Number.isInteger(value)
    ) {
      return String(value);
    }

    return String(
      Number(
        value.toFixed(4),
      ),
    );
  }

  // =========================================================
  // متن گزینه صحیح
  // =========================================================

  private getOptionText(
    answer: string,
    a: string,
    b: string,
    c: string,
    d: string,
  ): string {
    const options: Record<
      string,
      string
    > = {
      A: a,
      B: b,
      C: c,
      D: d,
    };

    return (
      options[answer] ??
      'گزینه صحیح در سوال مشخص شده است.'
    );
  }
}