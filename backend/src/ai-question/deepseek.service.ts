import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DeepSeekService {

  async generateQuestion(
    subject: string,
    chapter: string,
    difficulty: number,
  ) {


    const prompt = `
شما یک معلم حرفه‌ای ریاضی هستید.

یک سوال چهار گزینه‌ای تولید کنید.

موضوع:
${subject}

فصل:
${chapter}

سطح:
${difficulty}

خروجی فقط JSON باشد:

{
"title":"",
"optionA":"",
"optionB":"",
"optionC":"",
"optionD":"",
"correctAnswer":"",
"explanation":"",
"solution":""
}
`;



    const response =
      await axios.post(

        'https://api.deepseek.com/chat/completions',

        {
          model: "deepseek-chat",

          messages: [

            {
              role: "user",
              content: prompt
            }

          ],

          temperature: 0.7

        },


        {
          headers: {

            Authorization:
              `Bearer ${process.env.DEEPSEEK_API_KEY}`,

            "Content-Type":
              "application/json"

          }

        }

      );



    const content =
      response.data.choices[0].message.content;



    return JSON.parse(content);

  }

}