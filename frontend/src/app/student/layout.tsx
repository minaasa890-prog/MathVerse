export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-100"
    >
      <div className="flex">

        {/* Sidebar */}
        <aside className="hidden md:flex w-64 min-h-screen bg-blue-700 text-white p-6 flex-col">

          <h1 className="text-2xl font-bold mb-8">
            MathVerse 🚀
          </h1>


          <nav className="space-y-4">

            <a
              href="/student"
              className="block rounded-xl p-3 hover:bg-blue-600"
            >
              🏠 داشبورد
            </a>


            <a
              href="/student/lessons"
              className="block rounded-xl p-3 hover:bg-blue-600"
            >
              📚 درس‌ها
            </a>


            <a
              href="/student/exams"
              className="block rounded-xl p-3 hover:bg-blue-600"
            >
              📝 آزمون‌ها
            </a>


            <a
              href="/student/ai"
              className="block rounded-xl p-3 hover:bg-blue-600"
            >
              🤖 دستیار هوش مصنوعی
            </a>


          </nav>


          <div className="mt-auto text-sm opacity-80">
            MathVerse Platform
          </div>

        </aside>



        {/* Main */}
        <main className="flex-1 p-6">

          {children}

        </main>


      </div>
    </div>
  );
}