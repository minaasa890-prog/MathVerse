import { Link } from "react-router-dom";

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
      {/* Sidebar */}

      <aside
        className="
        fixed
        right-0
        top-0
        h-screen
        w-64
        bg-white
        shadow-xl
        p-6
        hidden
        md:block
        "
      >
        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          MathVerse
        </h1>

        <nav className="space-y-4">
          <Link
            to="/student/dashboard"
            className="block rounded-xl p-3 hover:bg-blue-50"
          >
            🏠 داشبورد
          </Link>

          <Link
            to="/student/lessons"
            className="block rounded-xl p-3 hover:bg-blue-50"
          >
            📚 درس‌های من
          </Link>

          <Link
            to="/student/exams"
            className="block rounded-xl p-3 hover:bg-blue-50"
          >
            📝 آزمون‌ها
          </Link>

          <Link
            to="/student/practice"
            className="block rounded-xl p-3 hover:bg-blue-50"
          >
            🧠 تمرین هوشمند
          </Link>

          <Link
            to="/student/ai-tutor"
            className="block rounded-xl p-3 hover:bg-blue-50"
          >
            🤖 معلم هوشمند
          </Link>

          <Link
            to="/student/achievements"
            className="block rounded-xl p-3 hover:bg-blue-50"
          >
            🏆 دستاوردها
          </Link>
        </nav>
      </aside>

      {/* Content */}

      <main
        className="
        md:mr-64
        min-h-screen
        "
      >
        {children}
      </main>
    </div>
  );
}
