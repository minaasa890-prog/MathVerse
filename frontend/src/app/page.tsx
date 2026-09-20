import Link from "next/link";

export default function Home() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8"
    >
      <div className="mx-auto max-w-5xl">

        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-blue-700">
            MathVerse
          </h1>

          <p className="mt-4 text-xl text-gray-700">
            یادگیری ریاضی با بازی، تمرین و هوش مصنوعی
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="text-4xl">
              📚
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              یادگیری
            </h2>

            <p className="mt-2 text-gray-600">
              فصل‌های ریاضی را قدم‌به‌قدم یاد بگیر.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="text-4xl">
              🎮
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              بازی آموزشی
            </h2>

            <p className="mt-2 text-gray-600">
              با بازی امتیاز بگیر و پیشرفت کن.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="text-4xl">
              🤖
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              هوش مصنوعی
            </h2>

            <p className="mt-2 text-gray-600">
              نقاط قوت و ضعف خودت را بشناس.
            </p>
          </div>

        </section>

        <div className="mt-12 text-center">

          <Link
            href="/login"
            className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white transition hover:bg-blue-700"
          >
            شروع یادگیری
          </Link>

        </div>

      </div>
    </main>
  );
}