import {
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DeepSeekService {
  async generateQuestion(
    subject: string,
    chapter: string,
    difficulty: number,
    mode: string = 'single',
    topics: string[] = [],
  ) {
    const isMixed =
      mode === 'mixed' &&
      Array.isArray(topics) &&
      topics.length >= 2;

    const normalizedTopics = Array.isArray(topics)
      ? topics
          .map((topic) => String(topic).trim())
          .filter(Boolean)
      : [];

    let prompt = '';

    if (isMixed) {
      prompt = `
تو یک طراح حرفه‌ای سؤال ریاضی هستی.

برای درس "${subject}" یک سؤال چهارگزینه‌ای با سطح دشواری ${difficulty}
طراحی کن که واقعاً ترکیبی از مباحث زیر باشد:

${normalizedTopics
  .map((topic, index) => `${index + 1}. ${topic}`)
  .join('\n')}

مبحث ترکیبی:
${chapter}

قوانین بسیار مهم:

1. سؤال باید واقعاً ترکیبی باشد و حل آن حداقل به دو مبحث از مباحث انتخاب‌شده نیاز داشته باشد.
2. اگر سه یا بیشتر مبحث انتخاب شده، ترجیحاً همه مباحث باید نقش واقعی در حل داشته باشند.
3. صرفاً نوشتن نام چند مبحث در سؤال کافی نیست.
4. سؤال نباید طوری باشد که فقط با استفاده از یک مبحث بتوان آن را حل کرد.
5. سؤال ساده و تک‌مبحثی ممنوع است.
6. مراحل حل باید زنجیره‌ای باشند؛ یعنی نتیجه یک بخش برای بخش بعدی استفاده شود.
7. هر مبحث انتخاب‌شده باید نقش واقعی و قابل مشاهده در حل داشته باشد.
8. از مباحث نامرتبط استفاده نکن.
9. سؤال باید کاملاً مستقل و قابل فهم باشد.
10. محاسبات ریاضی باید کاملاً صحیح باشند.
11. دقیقاً چهار گزینه ارائه کن.
12. فقط یک گزینه باید صحیح باشد.
13. گزینه‌های غلط باید منطقی و نزدیک به خطاهای رایج باشند.
14. مقدار correctAnswer باید دقیقاً برابر یکی از چهار گزینه باشد.
15. solution باید دقیقاً همین سؤال را حل کند.
16. اعداد، عبارت‌ها و شرایط سؤال را در solution تغییر نده.
17. solution باید مرحله‌به‌مرحله باشد.
18. solution باید واقعاً استفاده از حداقل دو مبحث انتخاب‌شده را نشان دهد.
19. در پایان solution باید پاسخ نهایی دقیقاً برابر correctAnswer باشد.
20. تمام محاسبات را قبل از خروجی نهایی دوباره بررسی کن.
21. اگر سؤال فقط با یک مبحث قابل حل است، آن را بازنویسی کن.
22. اگر پاسخ نهایی با correctAnswer یکی نیست، آن را اصلاح کن.
23. explanation باید کوتاه باشد ولی نشان دهد مباحث چگونه با هم ترکیب شده‌اند.
24. فقط JSON معتبر برگردان.
25. هیچ متن، توضیح یا Markdown خارج از JSON ننویس.

نمونه برای ترکیب «عبارت‌های جبری + توان + معادله»:

می‌توانی سؤال را به شکلی طراحی کنی که ابتدا یک معادله شامل توان حل شود،
سپس مقدار x در یک عبارت جبری قرار داده شود و نتیجه نهایی محاسبه شود.

مثلاً ساختاری شبیه:

2^(x-1) = 8

سپس از مقدار x برای محاسبه یک عبارت جبری استفاده شود.

توجه:
این فقط یک نمونه از ساختار است و نباید عیناً تکرار شود.

قبل از خروجی نهایی این موارد را کنترل کن:

- آیا سؤال واقعاً حداقل دو مبحث را لازم دارد؟
- اگر یکی از مباحث حذف شود، روش حل یا نتیجه تغییر می‌کند؟
- آیا solution دقیقاً سؤال نوشته‌شده را حل می‌کند؟
- آیا correctAnswer دقیقاً یکی از چهار گزینه است؟
- آیا پاسخ نهایی solution با correctAnswer برابر است؟

اگر پاسخ هرکدام «خیر» است، سؤال را اصلاح کن و سپس JSON نهایی را بده.

فرمت دقیق خروجی:

{
  "title": "عنوان سؤال",
  "description": "توضیح کوتاه درباره سؤال",
  "options": [
    "گزینه اول",
    "گزینه دوم",
    "گزینه سوم",
    "گزینه چهارم"
  ],
  "correctAnswer": "پاسخ صحیح",
  "explanation": "توضیح کوتاه",
  "solution": "حل کامل و مرحله‌به‌مرحله"
}
`;
    } else {
      prompt = `
تو یک طراح حرفه‌ای سؤال ریاضی هستی.

برای درس "${subject}" و مبحث "${chapter}"
یک سؤال چهارگزینه‌ای با سطح دشواری ${difficulty} طراحی کن.

قوانین:

1. سؤال از نظر ریاضی کاملاً صحیح باشد.
2. سؤال کاملاً مستقل و قابل فهم باشد.
3. دقیقاً چهار گزینه داشته باشد.
4. فقط یک گزینه صحیح باشد.
5. گزینه‌های غلط منطقی باشند.
6. correctAnswer باید دقیقاً برابر یکی از چهار گزینه باشد.
7. solution باید دقیقاً همین سؤال را حل کند.
8. solution باید مرحله‌به‌مرحله باشد.
9. explanation کوتاه و واضح باشد.
10. فقط JSON معتبر برگردان.
11. هیچ متن یا Markdown خارج از JSON ننویس.

فرمت دقیق خروجی:

{
  "title": "عنوان سؤال",
  "description": "توضیح کوتاه درباره سؤال",
  "options": [
    "گزینه اول",
    "گزینه دوم",
    "گزینه سوم",
    "گزینه چهارم"
  ],
  "correctAnswer": "پاسخ صحیح",
  "explanation": "توضیح کوتاه",
  "solution": "حل کامل و مرحله‌به‌مرحله"
}
`;
    }

    try {
      const response = await axios.post(
        'https://api.deepseek.com/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: isMixed ? 0.4 : 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      let content =
        response?.data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error(
          'DeepSeek returned empty response.',
        );
      }

      content = String(content).trim();

      // حذف Markdown code fence
      content = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      // استخراج JSON
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');

      if (
        firstBrace === -1 ||
        lastBrace === -1 ||
        lastBrace <= firstBrace
      ) {
        throw new Error(
          'DeepSeek response does not contain a valid JSON object.',
        );
      }

      content = content.slice(
        firstBrace,
        lastBrace + 1,
      );

      let parsed: any;

      try {
        parsed = JSON.parse(content);
      } catch (jsonError: any) {
        throw new Error(
          `Invalid JSON from DeepSeek: ${
            jsonError?.message || jsonError
          }`,
        );
      }

      // بررسی فیلدهای ضروری
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !parsed.title ||
        !parsed.description ||
        !Array.isArray(parsed.options) ||
        parsed.options.length !== 4 ||
        !parsed.correctAnswer ||
        !parsed.explanation ||
        !parsed.solution
      ) {
        throw new Error(
          'DeepSeek response is missing required fields.',
        );
      }

      // تمیز کردن گزینه‌ها
      const options = parsed.options.map(
        (option: any) =>
          String(option).trim(),
      );

      if (
        options.length !== 4 ||
        options.some(
          (option: string) => !option,
        )
      ) {
        throw new Error(
          'One or more options are empty.',
        );
      }

      // پاسخ صحیح باید دقیقاً یکی از گزینه‌ها باشد
      const correctAnswer = String(
        parsed.correctAnswer,
      ).trim();

      if (!options.includes(correctAnswer)) {
        throw new Error(
          `correctAnswer "${correctAnswer}" is not one of the options: ${options.join(
            ' | ',
          )}`,
        );
      }

      // solution باید پاسخ نهایی را داشته باشد
      const solution = String(
        parsed.solution,
      ).trim();

      if (!solution.includes(correctAnswer)) {
        throw new Error(
          `Solution does not contain correctAnswer "${correctAnswer}".`,
        );
      }

      // بررسی اطلاعات mixed
      if (isMixed) {
        const solutionLower =
          solution.toLowerCase();

        const topicHints =
          normalizedTopics.map(
            (topic) => ({
              topic,

              foundInQuestion:
                String(parsed.title)
                  .toLowerCase()
                  .includes(
                    topic.toLowerCase(),
                  ) ||
                String(parsed.description)
                  .toLowerCase()
                  .includes(
                    topic.toLowerCase(),
                  ),

              foundInSolution:
                solutionLower.includes(
                  topic.toLowerCase(),
                ),
            }),
          );

        console.log(
          '🧩 Mixed AI topic check:',
          JSON.stringify(
            topicHints,
            null,
            2,
          ),
        );
      }

      /*
       * نکته مهم:
       * AiExamService فعلی انتظار دارد
       * optionA / optionB / optionC / optionD
       * وجود داشته باشند.
       *
       * بنابراین هم options را نگه می‌داریم
       * و هم چهار فیلد قدیمی را برمی‌گردانیم.
       */
      return {
        title: String(
          parsed.title,
        ).trim(),

        description: String(
          parsed.description,
        ).trim(),

        options,

        optionA: options[0] || '',
        optionB: options[1] || '',
        optionC: options[2] || '',
        optionD: options[3] || '',

        correctAnswer,

        explanation: String(
          parsed.explanation,
        ).trim(),

        solution,
      };
    } catch (error: any) {
      console.error(
        '❌ DeepSeek validation error:',
        error?.message || error,
      );

      // نمایش پاسخ واقعی API بدون نمایش کلید
      if (error?.response) {
        console.error(
          '❌ DeepSeek API response:',
          JSON.stringify(
            error.response.data,
            null,
            2,
          ),
        );

        const status =
          error.response.status;

        if (status === 401) {
          throw new HttpException(
            'کلید دسترسی DeepSeek معتبر نیست.',
            HttpStatus.UNAUTHORIZED,
          );
        }

        if (status === 402) {
          throw new HttpException(
            'اعتبار حساب DeepSeek کافی نیست.',
            HttpStatus.PAYMENT_REQUIRED,
          );
        }

        if (status === 429) {
          throw new HttpException(
            'تعداد درخواست‌های DeepSeek بیش از حد مجاز است.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        throw new HttpException(
          'خطا در ارتباط با سرویس DeepSeek.',
          HttpStatus.BAD_GATEWAY,
        );
      }

      throw new HttpException(
        'پاسخ هوش مصنوعی ناقص یا ناسازگار است.',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}