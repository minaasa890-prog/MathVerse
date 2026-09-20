import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

interface Classroom {
  id: number;
  name: string;
  students: number;
  exams: number;
}

interface DashboardData {
  teacherId: number;
  name: string;
  totalClasses: number;
  totalStudents: number;
  totalExams: number;
  classes: Classroom[];
}

function StatCard({
  icon,
  title,
  value,
  type,
}: {
  icon: string;
  title: string;
  value: number;
  type: "classes" | "students" | "exams";
}) {
  const styles = {
    classes: {
      background: "linear-gradient(135deg, #eef2ff, #ffffff)",
      iconBackground: "#e0e7ff",
      iconColor: "#4f46e5",
    },
    students: {
      background: "linear-gradient(135deg, #ecfdf5, #ffffff)",
      iconBackground: "#d1fae5",
      iconColor: "#059669",
    },
    exams: {
      background: "linear-gradient(135deg, #fff7ed, #ffffff)",
      iconBackground: "#fed7aa",
      iconColor: "#ea580c",
    },
  };

  const current = styles[type];

  return (
    <div
      style={{
        background: current.background,
        border: "1px solid #e8ecf4",
        borderRadius: "20px",
        padding: "22px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 8px 25px rgba(15, 23, 42, 0.06)",
        transition: "all 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 14px 32px rgba(15, 23, 42, 0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 8px 25px rgba(15, 23, 42, 0.06)";
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: current.iconBackground,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "27px",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: "14px",
            color: "#64748b",
            marginBottom: "5px",
            fontWeight: 500,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "30px",
            lineHeight: 1,
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const teacherId = user?.id;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!teacherId) {
        console.error("TEACHER ID NOT FOUND");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        console.log(
          "🟢 REQUESTING TEACHER DASHBOARD:",
          `/teacher/dashboard/${teacherId}`,
        );

        const res = await api.get(
          `/teacher/dashboard/${teacherId}`,
        );

        console.log(
          "🟢 RAW TEACHER DASHBOARD DATA:",
          res.data,
        );

        const raw = res.data;

        const normalizedClasses: Classroom[] =
          Array.isArray(raw.classes)
            ? raw.classes.map((cls: any) => ({
                id: Number(cls.id),
                name: String(cls.name ?? "بدون نام"),

                students:
                  typeof cls.students === "number"
                    ? cls.students
                    : Array.isArray(cls.students)
                      ? cls.students.length
                      : Number(cls.studentCount ?? 0),

                exams:
                  typeof cls.exams === "number"
                    ? cls.exams
                    : Array.isArray(cls.exams)
                      ? cls.exams.length
                      : Number(cls.examCount ?? 0),
              }))
            : [];

        console.log(
          "🟢 NORMALIZED CLASSES:",
          normalizedClasses,
        );

        setData({
          teacherId: Number(raw.teacherId),
          name: String(raw.name ?? ""),
          totalClasses: Number(raw.totalClasses ?? 0),
          totalStudents: Number(raw.totalStudents ?? 0),
          totalExams: Number(raw.totalExams ?? 0),
          classes: normalizedClasses,
        });
      } catch (error) {
        console.error(
          "❌ TEACHER DASHBOARD ERROR:",
          error,
        );

        setData(null);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [teacherId]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #f8fafc, #eef2ff)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          direction: "rtl",
          padding: "30px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "35px 50px",
            boxShadow: "0 10px 35px rgba(15, 23, 42, 0.08)",
            color: "#475569",
            fontSize: "16px",
          }}
        >
          در حال بارگذاری داشبورد معلم...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          direction: "rtl",
          padding: "30px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            padding: "40px",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 10px 35px rgba(15, 23, 42, 0.08)",
            maxWidth: "420px",
            width: "100%",
          }}
        >
          <div style={{ fontSize: "45px", marginBottom: "15px" }}>
            ⚠️
          </div>

          <h2
            style={{
              margin: "0 0 10px",
              color: "#0f172a",
            }}
          >
            خطا در دریافت اطلاعات
          </h2>

          <p
            style={{
              color: "#64748b",
              marginBottom: "25px",
            }}
          >
            اطلاعات داشبورد معلم دریافت نشد.
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "11px 24px",
              border: "none",
              borderRadius: "10px",
              background: "#4f46e5",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "28px 20px 50px",
        direction: "rtl",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth: "1150px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #312e81 0%, #4f46e5 55%, #6366f1 100%)",
            borderRadius: "24px",
            padding: "28px 30px",
            marginBottom: "25px",
            color: "#ffffff",
            boxShadow: "0 15px 40px rgba(79, 70, 229, 0.20)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              top: "-80px",
              left: "-40px",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "14px",
                  opacity: 0.85,
                  marginBottom: "7px",
                }}
              >
                پنل مدیریت آموزشی
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "30px",
                  fontWeight: 800,
                }}
              >
                👨‍🏫 داشبورد معلم
              </h1>

              <p
                style={{
                  margin: "9px 0 0",
                  fontSize: "15px",
                  opacity: 0.9,
                }}
              >
                خوش آمدید، {data.name}
              </p>
            </div>

            <button
              onClick={() => navigate("/")}
              style={{
                padding: "11px 18px",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "12px",
                cursor: "pointer",
                background: "rgba(255,255,255,0.12)",
                color: "#ffffff",
                fontWeight: 700,
                backdropFilter: "blur(8px)",
              }}
            >
              🏠 صفحه اصلی
            </button>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "38px",
          }}
        >
          <StatCard
            icon="🏫"
            title="تعداد کلاس‌ها"
            value={data.totalClasses}
            type="classes"
          />

          <StatCard
            icon="👨‍🎓"
            title="تعداد دانش‌آموزان"
            value={data.totalStudents}
            type="students"
          />

          <StatCard
            icon="📝"
            title="تعداد آزمون‌ها"
            value={data.totalExams}
            type="exams"
          />
        </div>

        {/* Classes Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "18px",
            gap: "15px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "23px",
                fontWeight: 800,
              }}
            >
              کلاس‌های شما
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              مدیریت کلاس‌ها و مشاهده عملکرد دانش‌آموزان
            </p>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              padding: "8px 13px",
              borderRadius: "10px",
              color: "#64748b",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {data.classes.length} کلاس
          </div>
        </div>

        {/* Classes */}
        {data.classes.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              padding: "45px 30px",
              borderRadius: "20px",
              textAlign: "center",
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div style={{ fontSize: "45px", marginBottom: "12px" }}>
              🏫
            </div>

            <h3 style={{ margin: "0 0 8px" }}>
              هنوز کلاسی ثبت نشده است
            </h3>

            <p
              style={{
                margin: 0,
                color: "#64748b",
              }}
            >
              هنوز کلاسی برای این معلم ثبت نشده است.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {data.classes.map((cls) => (
              <div
                key={cls.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  padding: "22px",
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 8px 25px rgba(15, 23, 42, 0.06)",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 18px 38px rgba(15, 23, 42, 0.11)";
                  e.currentTarget.style.borderColor =
                    "#c7d2fe";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(15, 23, 42, 0.06)";
                  e.currentTarget.style.borderColor =
                    "#e2e8f0";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "13px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #eef2ff, #e0e7ff)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                    }}
                  >
                    🏫
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "17px",
                        fontWeight: 800,
                        color: "#0f172a",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cls.name}
                    </h3>

                    <span
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                      }}
                    >
                      کلاس شماره {cls.id}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "14px",
                      padding: "14px",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        marginBottom: "6px",
                      }}
                    >
                      👨‍🎓 دانش‌آموزان
                    </div>

                    <strong
                      style={{
                        fontSize: "25px",
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {cls.students}
                    </strong>
                  </div>

                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "14px",
                      padding: "14px",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        marginBottom: "6px",
                      }}
                    >
                      📝 آزمون‌ها
                    </div>

                    <strong
                      style={{
                        fontSize: "25px",
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {cls.exams}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(`/teacher/class/${cls.id}`)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    background:
                      "linear-gradient(135deg, #4f46e5, #6366f1)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "14px",
                    boxShadow:
                      "0 6px 15px rgba(79, 70, 229, 0.20)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 9px 20px rgba(79, 70, 229, 0.28)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 15px rgba(79, 70, 229, 0.20)";
                  }}
                >
                  مشاهده کلاس ←
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}