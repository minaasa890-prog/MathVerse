import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";

// Student
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentPractice from "./pages/student/StudentPractice";
import StudentExams from "./pages/student/StudentExams";
import StudentExamStart from "./pages/student/StudentExamStart";

// Teacher
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClassDetail from "./pages/teacher/TeacherClassDetail";
import TeacherStudentDetail from "./pages/teacher/TeacherStudentDetail";
import ExamManagement from "./pages/teacher/ExamManagement";
import ExamPreview from "./pages/teacher/ExamPreview";
import CreateAIExam from "./pages/teacher/CreateAIExam";
import CreateQuestion from "./pages/teacher/CreateQuestion";

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            LOGIN
        ========================== */}
        <Route
          path="/login"
          element={<Login />}
        />


        {/* =========================
            STUDENT
        ========================== */}

        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/practice"
          element={
            <ProtectedRoute>
              <StudentPractice />
            </ProtectedRoute>
          }
        />

        {/* لیست آزمون‌های دانش‌آموز */}
        <Route
          path="/student/exams"
          element={
            <ProtectedRoute>
              <StudentExams />
            </ProtectedRoute>
          }
        />

        {/* شروع یک آزمون */}
        <Route
          path="/student/exams/:examId"
          element={
            <ProtectedRoute>
              <StudentExamStart />
            </ProtectedRoute>
          }
        />


        {/* =========================
            TEACHER
        ========================== */}

        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/class/:id"
          element={
            <ProtectedRoute>
              <TeacherClassDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/student/:studentId"
          element={
            <ProtectedRoute>
              <TeacherStudentDetail />
            </ProtectedRoute>
          }
        />

        {/* مدیریت آزمون‌ها */}
        <Route
          path="/teacher/class/:id/exams"
          element={
            <ProtectedRoute>
              <ExamManagement />
            </ProtectedRoute>
          }
        />

        {/* پیش‌نمایش آزمون */}
        <Route
          path="/teacher/class/:id/exam/:examId/preview"
          element={
            <ProtectedRoute>
              <ExamPreview />
            </ProtectedRoute>
          }
        />

        {/* ساخت آزمون با AI */}
        <Route
          path="/teacher/class/:id/create-exam"
          element={
            <ProtectedRoute>
              <CreateAIExam />
            </ProtectedRoute>
          }
        />

        {/* ساخت سؤال دستی */}
        <Route
          path="/teacher/class/:id/create-question"
          element={
            <ProtectedRoute>
              <CreateQuestion />
            </ProtectedRoute>
          }
        />


        {/* =========================
            DEFAULT
        ========================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
