import { Injectable } from '@nestjs/common';


@Injectable()
export class AiProviderService {


async generateSolution(
title:string,
options:any = {},
correctAnswer:string = ""
){


console.log(
"NEW AI PROVIDER RUNNING:",
title
);



let text = `


🤖 راه حل هوش مصنوعی MathVerse


سوال:

${title}



`;



// ===============================
// حل معادلات
// ===============================


const equation =
this.solveEquation(title);



if(equation){

return text + equation;

}




// ===============================
// حل عبارت ریاضی
// ===============================


const expression =
this.solveExpression(title);



if(expression){

return text + expression;

}




// ===============================
// سوالات متنی
// ===============================


if(
title.includes("علی") ||
title.includes("مداد") ||
title.includes("خرید")
){

const numbers =
title.match(/\d+/g);


if(numbers && numbers.length >= 2){


const a =
Number(numbers[0]);


const b =
Number(numbers[1]);


const sum =
a + b;



return text + `


📚 حل مسئله:


سوال درباره اضافه شدن مقدار است.



اطلاعات مهم:


تعداد اولیه:

${a}



مقدار اضافه شده:

${b}



عملیات:


${a} + ${b} = ${sum}



پس:


جواب نهایی:


${sum}



پاسخ صحیح:

گزینه ${correctAnswer}



`;

}


}



if(
title.includes("دما") ||
title.includes("درجه")
){


const numbers =
title.match(/\d+/g);


if(numbers && numbers.length >= 2){


const first =
Number(numbers[0]);


const increase =
Number(numbers[1]);



const result =
increase-first;



return text + `


📚 حل مسئله دما:


دمای اولیه:

-${first} درجه



افزایش دما:

${increase} درجه



محاسبه:


-${first} + ${increase} = ${result}



دمای جدید:


${result} درجه



پاسخ صحیح:

گزینه ${correctAnswer}



`;

}

}




// ===============================
// سوال عمومی
// ===============================


return text + `


📚 تحلیل سوال:


ابتدا مفهوم سوال را بررسی می‌کنیم.


اطلاعات مهم را استخراج می‌کنیم.


سپس روش مناسب حل را انتخاب می‌کنیم.



مراحل حل:


1) فهمیدن مسئله


2) پیدا کردن اطلاعات مهم


3) انتخاب روش مناسب


4) بررسی جواب نهایی



پاسخ صحیح:


گزینه ${correctAnswer}



این پاسخ توسط سیستم هوشمند MathVerse تولید شده است.


`;

}






// =================================================
// حل معادله
// =================================================


private solveEquation(
equation:string
){


let clean =
equation
.replace("؟","")
.replace("باشد","")
.replace("چند است","")
.trim();





// =================================
// 3x = 12
// =================================


const multiply =
clean.match(
/(\d+)x\s*=\s*(\d+)/
);



if(multiply){


const a =
Number(multiply[1]);


const b =
Number(multiply[2]);


const x =
b / a;



return `


📚 حل معادله:


${clean}



ضریب x برابر است با:


${a}



دو طرف معادله را بر ${a} تقسیم می‌کنیم:



x = ${b} ÷ ${a}



x = ${x}



✅ پاسخ نهایی:


x = ${x}



`;

}








// =================================
// x + 3 = 10
// x - 5 = 9
// =================================


const simple =
clean.match(
/x\s*([+-])\s*(\d+)\s*=\s*(\d+)/
);



if(simple){



const sign =
simple[1];


const number =
Number(simple[2]);


const result =
Number(simple[3]);



let x;



if(sign === "+"){


x =
result - number;


}

else{


x =
result + number;


}




return `


📚 حل معادله:


${clean}



عدد ثابت را به طرف دیگر منتقل می‌کنیم:



x = ${x}



محاسبه:



x = ${x}



✅ پاسخ نهایی:


x = ${x}



`;

}








// =================================
// 5x - 10 = 2x + 8
// =================================


const complex =
clean.match(
/(\d+)x\s*([+-])\s*(\d+)\s*=\s*(\d+)x\s*([+-])\s*(\d+)/
);



if(complex){



const a =
Number(complex[1]);


const op1 =
complex[2];


const b =
Number(complex[3]);


const c =
Number(complex[4]);


const op2 =
complex[5];


const d =
Number(complex[6]);



let leftConstant =
op1 === "+"
?
b
:
-b;



let rightConstant =
op2 === "+"
?
d
:
-d;





const coefficient =
a-c;



const constant =
rightConstant-leftConstant;



const x =
constant/coefficient;




return `


📚 حل معادله:


${clean}



مرحله اول:


x ها را یک طرف قرار می‌دهیم:



${a}x - ${c}x = ${rightConstant} - (${leftConstant})



مرحله دوم:


${coefficient}x = ${constant}



مرحله سوم:


x = ${constant} ÷ ${coefficient}



x = ${x}



✅ پاسخ نهایی:


x = ${x}



`;

}




return null;


}








// =================================================
// حل عبارت عددی
// =================================================


private solveExpression(
title:string
){



let expression =
title
.replace("حاصل","")
.replace("چیست","")
.replace("؟","")
.trim();



expression =
expression
.replace(/×/g,"*")
.replace(/÷/g,"/");



if(!/[0-9]/.test(expression))

return null;




try{


const result =
Function(
`return (${expression})`
)();



return `


📚 حل عبارت:


${expression}



با رعایت اولویت عملیات:



جواب نهایی:


${result}



`;



}

catch{


return null;


}



}


}