import { Injectable } from '@nestjs/common';

@Injectable()
export class SolutionGeneratorService {

  generate(question: any) {

    const text =
      `${question.title || ''} ${question.description || ''}`.trim();

    // =========================================================
    // 1. اگر سؤال راه‌حل اختصاصی دارد
    // =========================================================

    if (question.solution) {
      return {
        explanation:
          question.explanation ||
          'راه‌حل مرحله‌به‌مرحله سؤال',

        solution:
          question.solution,
      };
    }

    // =========================================================
    // 2. عملیات چهارگانه ساده
    // مثال:
    // -24 ÷ 6
    // 3 + 5
    // 7 - 12
    // 4 × 6
    // =========================================================

    const arithmetic =
      text.match(
        /(-?\d+(?:\.\d+)?)\s*([+\-×x*÷\/])\s*(-?\d+(?:\.\d+)?)/i
      );

    if (arithmetic) {

      const a = Number(arithmetic[1]);
      const operator = arithmetic[2];
      const b = Number(arithmetic[3]);

      let result: number | null = null;
      let operation = '';

      switch (operator) {

        case '+':
          result = a + b;
          operation = 'جمع';
          break;

        case '-':
          result = a - b;
          operation = 'تفریق';
          break;

        case '×':
        case 'x':
        case '*':
          result = a * b;
          operation = 'ضرب';
          break;

        case '÷':
        case '/':
          if (b !== 0) {
            result = a / b;
          }
          operation = 'تقسیم';
          break;
      }

      if (
        result !== null &&
        Number.isFinite(result)
      ) {

        return this.buildArithmeticSolution(
          question,
          a,
          b,
          operator,
          result,
          operation
        );
      }
    }

    // =========================================================
    // 3. اولویت عملیات
    // مثال:
    // 8 + 4 × 2
    // =========================================================

    const priority =
      text.match(
        /(-?\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)\s*[×x*]\s*(-?\d+(?:\.\d+)?)/i
      );

    if (priority) {

      const a = Number(priority[1]);
      const b = Number(priority[2]);
      const c = Number(priority[3]);

      const multiplication =
        b * c;

      const result =
        a + multiplication;

      const option =
        this.findCorrectOption(
          question,
          result
        );

      const steps: string[] = [];

      steps.push(
        `مرحله 1: عبارت را داریم: ${a} + ${b} × ${c}`
      );

      steps.push(
        'مرحله 2: طبق قانون اولویت عملیات، ابتدا ضرب را انجام می‌دهیم.'
      );

      steps.push(
        `مرحله 3: ${b} × ${c} = ${multiplication}`
      );

      steps.push(
        `مرحله 4: حالا جمع را انجام می‌دهیم: ${a} + ${multiplication} = ${result}`
      );

      if (option) {
        steps.push(
          `مرحله 5: بنابراین پاسخ صحیح ${option} است.`
        );
      } else {
        steps.push(
          `پاسخ نهایی: ${result}`
        );
      }

      return {
        explanation:
          'حل مرحله‌به‌مرحله با رعایت اولویت عملیات',

        solution:
          steps.join('\n'),
      };
    }

    // =========================================================
    // 4. معادله ساده
    // مثال:
    // x + 3 = 10
    // x - 5 = 9
    // =========================================================

    const simpleEquation =
      text.match(
        /\bx\s*([+\-])\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/i
      );

    if (simpleEquation) {

      const operator =
        simpleEquation[1];

      const constant =
        Number(simpleEquation[2]);

      const right =
        Number(simpleEquation[3]);

      let x: number;

      if (operator === '+') {
        x = right - constant;
      } else {
        x = right + constant;
      }

      const option =
        this.findCorrectOption(
          question,
          x
        );

      const steps: string[] = [];

      steps.push(
        `مرحله 1: معادله را داریم: x ${operator} ${constant} = ${right}`
      );

      if (operator === '+') {

        steps.push(
          `مرحله 2: برای حذف ${constant}، ${constant} را از دو طرف کم می‌کنیم.`
        );

        steps.push(
          `مرحله 3: x = ${right} - ${constant}`
        );

        steps.push(
          `مرحله 4: x = ${x}`
        );

      } else {

        steps.push(
          `مرحله 2: برای حذف ${constant}، ${constant} را به دو طرف اضافه می‌کنیم.`
        );

        steps.push(
          `مرحله 3: x = ${right} + ${constant}`
        );

        steps.push(
          `مرحله 4: x = ${x}`
        );
      }

      if (option) {

        steps.push(
          `مرحله 5: بنابراین پاسخ صحیح ${option} است.`
        );

      } else {

        steps.push(
          `پاسخ نهایی: x = ${x}`
        );
      }

      return {
        explanation:
          'حل معادله مرحله‌به‌مرحله',

        solution:
          steps.join('\n'),
      };
    }

    // =========================================================
    // 5. معادله ax + b = c
    // مثال:
    // 2x + 5 = 17
    // =========================================================

    const linearEquation =
      text.match(
        /(-?\d+(?:\.\d+)?)\s*x\s*([+\-])\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/i
      );

    if (linearEquation) {

      const coefficient =
        Number(linearEquation[1]);

      const operator =
        linearEquation[2];

      const constant =
        Number(linearEquation[3]);

      const right =
        Number(linearEquation[4]);

      if (coefficient !== 0) {

        let remaining: number;

        if (operator === '+') {
          remaining =
            right - constant;
        } else {
          remaining =
            right + constant;
        }

        const x =
          remaining /
          coefficient;

        const option =
          this.findCorrectOption(
            question,
            x
          );

        const steps: string[] = [];

        steps.push(
          `مرحله 1: معادله را داریم: ${coefficient}x ${operator} ${constant} = ${right}`
        );

        if (operator === '+') {

          steps.push(
            `مرحله 2: ${constant} را از دو طرف کم می‌کنیم.`
          );

        } else {

          steps.push(
            `مرحله 2: ${constant} را به دو طرف اضافه می‌کنیم.`
          );
        }

        steps.push(
          `مرحله 3: ${coefficient}x = ${remaining}`
        );

        steps.push(
          `مرحله 4: دو طرف را بر ${coefficient} تقسیم می‌کنیم.`
        );

        steps.push(
          `مرحله 5: x = ${x}`
        );

        if (option) {

          steps.push(
            `مرحله 6: بنابراین پاسخ صحیح ${option} است.`
          );

        }

        return {
          explanation:
            'حل معادله خطی مرحله‌به‌مرحله',

          solution:
            steps.join('\n'),
        };
      }
    }

    // =========================================================
    // 6. الگوهای عددی ساده
    // مثال:
    // 2، 4، 6، ؟
    // =========================================================

    const sequence =
      text.match(
        /(\d+)\s*[,،]\s*(\d+)\s*[,،]\s*(\d+)\s*[,،]?\s*[؟?]/
      );

    if (sequence) {

      const a =
        Number(sequence[1]);

      const b =
        Number(sequence[2]);

      const c =
        Number(sequence[3]);

      const d1 =
        b - a;

      const d2 =
        c - b;

      const steps: string[] = [];

      steps.push(
        `مرحله 1: اعداد داده‌شده عبارت‌اند از: ${a}، ${b}، ${c}`
      );

      steps.push(
        `مرحله 2: اختلاف دو عدد اول را پیدا می‌کنیم: ${b} - ${a} = ${d1}`
      );

      steps.push(
        `مرحله 3: اختلاف دو عدد بعدی را بررسی می‌کنیم: ${c} - ${b} = ${d2}`
      );

      if (d1 === d2) {

        const result =
          c + d1;

        steps.push(
          `مرحله 4: چون الگو هر بار ${d1} واحد افزایش پیدا می‌کند، عدد بعدی ${c} + ${d1} = ${result} است.`
        );

        const option =
          this.findCorrectOption(
            question,
            result
          );

        if (option) {

          steps.push(
            `مرحله 5: بنابراین پاسخ صحیح ${option} است.`
          );

        } else {

          steps.push(
            `پاسخ نهایی: ${result}`
          );
        }

        return {
          explanation:
            'حل الگوی عددی مرحله‌به‌مرحله',

          solution:
            steps.join('\n'),
        };
      }
    }

    // =========================================================
    // 7. مسائل متنی جمع
    // =========================================================

    const additionWord =
      text.match(
        /(\d+)\s*(?:مداد|کتاب|سیب|عدد|تا)?\s*(?:داشته باشد|دارد|داشت).*?(\d+)\s*(?:مداد|کتاب|سیب|عدد|تا)?\s*(?:دیگر)?\s*(?:بخرد|بخرید|اضافه|اضافه می‌شود|دیگر)/i
      );

    if (additionWord) {

      const first =
        Number(additionWord[1]);

      const second =
        Number(additionWord[2]);

      const result =
        first + second;

      const option =
        this.findCorrectOption(
          question,
          result
        );

      const steps: string[] = [];

      steps.push(
        `مرحله 1: مقدار اولیه ${first} است.`
      );

      steps.push(
        `مرحله 2: ${second} مورد دیگر به مقدار اولیه اضافه می‌شود، پس باید جمع کنیم.`
      );

      steps.push(
        `مرحله 3: ${first} + ${second} = ${result}`
      );

      steps.push(
        `مرحله 4: بنابراین مقدار نهایی برابر با ${result} است.`
      );

      if (option) {

        steps.push(
          `مرحله 5: پاسخ صحیح ${option} است.`
        );
      }

      return {
        explanation:
          'حل مسئله متنی مرحله‌به‌مرحله',

        solution:
          steps.join('\n'),
      };
    }

    // =========================================================
    // 8. مسائل متنی خیلی ساده با کلمات «جمع»
    // =========================================================

    if (
      /چند.*دار|چند.*دارد|در مجموع|مجموع/i.test(text)
    ) {

      const numbers =
        text.match(
          /-?\d+(?:\.\d+)?/g
        );

      if (
        numbers &&
        numbers.length >= 2
      ) {

        const a =
          Number(numbers[0]);

        const b =
          Number(numbers[1]);

        const result =
          a + b;

        const option =
          this.findCorrectOption(
            question,
            result
          );

        const steps: string[] = [];

        steps.push(
          `مرحله 1: عددهای مسئله را مشخص می‌کنیم: ${a} و ${b}`
        );

        steps.push(
          'مرحله 2: چون مقدار دوم به مقدار اول اضافه شده است، از عمل جمع استفاده می‌کنیم.'
        );

        steps.push(
          `مرحله 3: ${a} + ${b} = ${result}`
        );

        if (option) {

          steps.push(
            `مرحله 4: بنابراین پاسخ صحیح ${option} است.`
          );

        } else {

          steps.push(
            `پاسخ نهایی: ${result}`
          );
        }

        return {
          explanation:
            'حل مسئله مرحله‌به‌مرحله',

          solution:
            steps.join('\n'),
        };
      }
    }

    // =========================================================
    // 9. پاسخ عمومی
    // =========================================================

    const option =
      this.getCorrectOption(
        question
      );

    return {

      explanation:
        question.explanation ||
        'برای حل این سؤال، اطلاعات مهم را مشخص کرده و عملیات مناسب را انتخاب می‌کنیم.',

      solution:
        question.solution ||
        [
          'مرحله 1: صورت سؤال را با دقت می‌خوانیم.',

          'مرحله 2: اطلاعات مهم سؤال را مشخص می‌کنیم.',

          'مرحله 3: روش مناسب برای حل سؤال را انتخاب می‌کنیم.',

          'مرحله 4: محاسبات لازم را انجام می‌دهیم.',

          option
            ? `مرحله 5: بنابراین پاسخ صحیح ${option} است.`
            : 'مرحله 5: پاسخ نهایی را با محاسبات انجام‌شده بررسی می‌کنیم.',
        ].join('\n'),
    };
  }

  // =========================================================
  // ساخت راه‌حل عملیات چهارگانه
  // =========================================================

  private buildArithmeticSolution(
    question: any,
    a: number,
    b: number,
    operator: string,
    result: number,
    operation: string
  ) {

    const steps: string[] = [];

    steps.push(
      `مرحله 1: عبارت داده‌شده را بررسی می‌کنیم: ${a} ${operator} ${b}`
    );

    // -----------------------------
    // علامت‌ها
    // -----------------------------

    const signExplanation =
      this.getSignExplanation(
        a,
        b,
        operator
      );

    if (signExplanation) {
      steps.push(
        `مرحله 2: ${signExplanation}`
      );
    }

    // -----------------------------
    // محاسبه
    // -----------------------------

    const calculationStep =
      signExplanation
        ? 3
        : 2;

    steps.push(
      `مرحله ${calculationStep}: ${a} ${operator} ${b} = ${result}`
    );

    // -----------------------------
    // پاسخ گزینه
    // -----------------------------

    const option =
      this.findCorrectOption(
        question,
        result
      );

    if (option) {

      steps.push(
        `مرحله ${calculationStep + 1}: بنابراین پاسخ صحیح ${option} است.`
      );

    } else {

      steps.push(
        `پاسخ نهایی: ${result}`
      );
    }

    return {

      explanation:
        `حل مرحله‌به‌مرحله ${operation}`,

      solution:
        steps.join('\n'),
    };
  }

  // =========================================================
  // توضیح علامت‌ها
  // =========================================================

  private getSignExplanation(
    a: number,
    b: number,
    operator: string
  ): string {

    // تقسیم
    if (
      operator === '÷' ||
      operator === '/'
    ) {

      if (
        a < 0 &&
        b < 0
      ) {

        return (
          'در تقسیم دو عدد منفی، علامت‌ها یکسان هستند؛ بنابراین حاصل مثبت است.'
        );
      }

      if (
        (a < 0 && b > 0) ||
        (a > 0 && b < 0)
      ) {

        return (
          'در تقسیم دو عدد با علامت متفاوت، حاصل منفی است.'
        );
      }

      return (
        'چون هر دو عدد مثبت هستند، حاصل مثبت است.'
      );
    }

    // ضرب
    if (
      operator === '×' ||
      operator === 'x' ||
      operator === '*'
    ) {

      if (
        (a < 0 && b < 0) ||
        (a > 0 && b > 0)
      ) {

        return (
          'حاصل ضرب دو عدد هم‌علامت، مثبت است.'
        );
      }

      return (
        'حاصل ضرب دو عدد با علامت متفاوت، منفی است.'
      );
    }

    // جمع
    if (operator === '+') {

      if (
        a < 0 &&
        b < 0
      ) {

        return (
          'هر دو عدد منفی هستند؛ بنابراین قدرمطلق آن‌ها را جمع کرده و علامت منفی را حفظ می‌کنیم.'
        );
      }

      if (
        a < 0 &&
        b > 0
      ) {

        return (
          'در جمع یک عدد منفی و یک عدد مثبت، علامت عددی که قدرمطلق بزرگ‌تری دارد تعیین‌کننده علامت حاصل است.'
        );
      }

      if (
        a > 0 &&
        b < 0
      ) {

        return (
          'در جمع یک عدد مثبت و یک عدد منفی، قدرمطلق عددها را مقایسه می‌کنیم و تفاضل آن‌ها را به دست می‌آوریم.'
        );
      }
    }

    // تفریق
    if (operator === '-') {

      if (
        b < 0
      ) {

        return (
          'در تفریق یک عدد منفی، در واقع عدد مثبت به مقدار اول اضافه می‌شود.'
        );
      }
    }

    return '';
  }

  // =========================================================
  // پیدا کردن گزینه بر اساس مقدار عددی
  // =========================================================

  private findCorrectOption(
    question: any,
    result: number
  ): string | null {

    const options = [
      {
        key: 'A',
        value: question.optionA,
      },
      {
        key: 'B',
        value: question.optionB,
      },
      {
        key: 'C',
        value: question.optionC,
      },
      {
        key: 'D',
        value: question.optionD,
      },
    ];

    const normalizedResult =
      this.normalizeNumber(
        result
      );

    const found =
      options.find(
        option => {

          if (
            option.value === null ||
            option.value === undefined
          ) {
            return false;
          }

          const value =
            Number(
              option.value
            );

          if (
            !Number.isFinite(value)
          ) {
            return false;
          }

          return (
            this.normalizeNumber(
              value
            ) ===
            normalizedResult
          );
        }
      );

    if (found) {

      return `${found.key}) ${found.value}`;
    }

    // اگر correctAnswer به صورت A/B/C/D ذخیره شده
    if (
      question.correctAnswer
    ) {

      const answer =
        question.correctAnswer
          .toString()
          .trim();

      if (
        /^[A-D]$/i.test(answer)
      ) {

        const key =
          answer.toUpperCase();

        const optionsByKey: Record<
          string,
          any
        > = {

          A: question.optionA,

          B: question.optionB,

          C: question.optionC,

          D: question.optionD,
        };

        if (
          optionsByKey[key] !==
            null &&
          optionsByKey[key] !==
            undefined
        ) {

          return `${key}) ${optionsByKey[key]}`;
        }

        return key;
      }
    }

    return null;
  }

  // =========================================================
  // پیدا کردن پاسخ صحیح
  // =========================================================

  private getCorrectOption(
    question: any
  ): string | null {

    if (
      !question.correctAnswer
    ) {
      return null;
    }

    const answer =
      question.correctAnswer
        .toString()
        .trim();

    // A / B / C / D
    if (
      /^[A-D]$/i.test(answer)
    ) {

      const key =
        answer.toUpperCase();

      const options: Record<
        string,
        string | null | undefined
      > = {

        A: question.optionA,

        B: question.optionB,

        C: question.optionC,

        D: question.optionD,
      };

      return options[key]
        ? `${key}) ${options[key]}`
        : key;
    }

    // پیدا کردن گزینه با مقدار
    const options: Array<
      [string, any]
    > = [

      ['A', question.optionA],

      ['B', question.optionB],

      ['C', question.optionC],

      ['D', question.optionD],
    ];

    const found =
      options.find(
        ([, value]) => {

          if (
            value === null ||
            value === undefined
          ) {
            return false;
          }

          return (
            value
              .toString()
              .trim() ===
            answer
          );
        }
      );

    if (found) {

      return `${found[0]}) ${found[1]}`;
    }

    return answer;
  }

  // =========================================================
  // نرمال‌سازی عدد
  // =========================================================

  private normalizeNumber(
    value: number
  ): number {

    if (
      !Number.isFinite(value)
    ) {
      return NaN;
    }

    return (
      Math.round(
        value * 1000000
      ) / 1000000
    );
  }
}