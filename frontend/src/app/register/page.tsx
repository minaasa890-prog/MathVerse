export default function RegisterPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6"
    >

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

        <h1 className="text-center text-3xl font-bold text-purple-700">
          ثبت‌نام در MathVerse
        </h1>

        <p className="mt-3 text-center text-gray-600">
          حساب آموزشی خود را بسازید
        </p>


        <div className="mt-8 space-y-4">

          <input
            type="text"
            placeholder="نام و نام خانوادگی"
            className="w-full rounded-xl border p-3 text-right outline-none focus:ring-2 focus:ring-purple-400"
          />


          <input
            type="email"
            placeholder="ایمیل"
            className="w-full rounded-xl border p-3 text-right outline-none focus:ring-2 focus:ring-purple-400"
          />


          <input
            type="password"
            placeholder="رمز عبور"
            className="w-full rounded-xl border p-3 text-right outline-none focus:ring-2 focus:ring-purple-400"
          />


          <select
            className="w-full rounded-xl border p-3 text-right outline-none focus:ring-2 focus:ring-purple-400"
          >

            <option>
              دانش‌آموز
            </option>

            <option>
              معلم
            </option>

          </select>


          <button
            className="w-full rounded-xl bg-purple-600 py-3 text-white font-bold hover:bg-purple-700"
          >
            ایجاد حساب
          </button>


        </div>


        <div className="mt-6 text-center text-sm text-gray-600">

          حساب دارید؟

          <span className="mr-2 cursor-pointer text-purple-600">
            ورود
          </span>

        </div>


      </div>

    </main>
  );
}