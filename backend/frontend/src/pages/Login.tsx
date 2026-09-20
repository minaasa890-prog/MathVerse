import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../api/config";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    setError("");

    if (!email.trim() || !password) {
      setError(
        "لطفاً ایمیل و رمز عبور خود را وارد کنید."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "ورود ناموفق بود."
        );
      }

      /* ==========================================
         ذخیره اطلاعات ورود از طریق AuthContext
      ========================================== */

      login(data);

      console.log("LOGIN USER:", data.user);
      console.log("LOGIN ROLE:", data.user?.role);

      /* ==========================================
         انتقال بر اساس نقش کاربر
      ========================================== */

      if (data.user.role === "PARENT") {
        navigate("/parent/dashboard");
      } else if (data.user.role === "STUDENT") {
        navigate("/student/dashboard");
      } else if (data.user.role === "TEACHER") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(
        err?.message ||
          "خطایی هنگام ورود رخ داد."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 20px",
        boxSizing: "border-box",
        fontFamily:
          "Tahoma, Arial, sans-serif",
        background:
          "linear-gradient(135deg, #eef6ff 0%, #f5f3ff 50%, #eef2ff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ==========================================
          Background decorations
      ========================================== */}

      <div
        style={{
          position: "absolute",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background:
            "rgba(59, 130, 246, 0.10)",
          top: "-120px",
          right: "-100px",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background:
            "rgba(124, 58, 237, 0.08)",
          bottom: "-100px",
          left: "-80px",
        }}
      />

      {/* ==========================================
          Main container
      ========================================== */}

      <div
        style={{
          width: "100%",
          maxWidth: "1050px",
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          background: "white",
          borderRadius: "30px",
          overflow: "hidden",
          boxShadow:
            "0 25px 70px rgba(30, 41, 59, 0.15)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ========================================
            LEFT / BRAND SECTION
        ======================================== */}

        <section
          style={{
            minHeight: "600px",
            padding: "55px",
            boxSizing: "border-box",
            background:
              "linear-gradient(145deg, #1d4ed8 0%, #4338ca 55%, #6d28d9 100%)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Mathematical decorations */}

          <div
            style={{
              position: "absolute",
              top: "25px",
              left: "35px",
              fontSize: "48px",
              opacity: 0.18,
              fontWeight: "bold",
            }}
          >
            π
          </div>

          <div
            style={{
              position: "absolute",
              top: "120px",
              right: "35px",
              fontSize: "42px",
              opacity: 0.16,
              fontWeight: "bold",
            }}
          >
            ∑
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "35px",
              left: "80px",
              fontSize: "55px",
              opacity: 0.14,
              fontWeight: "bold",
            }}
          >
            √
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "100px",
              right: "45px",
              fontSize: "38px",
              opacity: 0.15,
              fontWeight: "bold",
            }}
          >
            ∞
          </div>

          {/* Logo */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "55px",
            }}
          >
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "18px",
                background:
                  "rgba(255,255,255,0.18)",
                border:
                  "1px solid rgba(255,255,255,0.30)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                fontWeight: "bold",
                backdropFilter: "blur(8px)",
              }}
            >
              ∑
            </div>

            <div>
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: "800",
                  letterSpacing: "-1px",
                }}
              >
                MathVerse
              </div>

              <div
                style={{
                  fontSize: "13px",
                  opacity: 0.8,
                  marginTop: "4px",
                }}
              >
                Smart Mathematics Learning
              </div>
            </div>
          </div>

          {/* Main text */}

          <h2
            style={{
              margin: 0,
              fontSize: "34px",
              lineHeight: 1.5,
              fontWeight: "800",
            }}
          >
            یادگیری ریاضی،
            <br />
            هوشمند و شخصی‌سازی‌شده
          </h2>

          <p
            style={{
              marginTop: "22px",
              marginBottom: "35px",
              fontSize: "16px",
              lineHeight: 2,
              color: "rgba(255,255,255,0.85)",
              maxWidth: "430px",
            }}
          >
            با MathVerse تمرین کن، پیشرفت خودت را
            ببین و مسیر یادگیری ریاضی را متناسب
            با توانایی‌هایت ادامه بده.
          </p>

          {/* Feature items */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background:
                    "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                🎯
              </span>

              <span>
                تمرین هوشمند و تطبیقی
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background:
                    "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                📊
              </span>

              <span>
                تحلیل پیشرفت و نقاط ضعف
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background:
                    "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                🧠
              </span>

              <span>
                یادگیری با کمک هوش مصنوعی
              </span>
            </div>
          </div>
        </section>

        {/* ========================================
            RIGHT / LOGIN FORM
        ======================================== */}

        <section
          style={{
            padding: "55px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "#ffffff",
          }}
        >
          {/* Heading */}

          <div
            style={{
              textAlign: "right",
              marginBottom: "35px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#eff6ff",
                color: "#2563eb",
                padding: "8px 14px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "18px",
              }}
            >
              🔐 ورود امن
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "31px",
                color: "#111827",
                fontWeight: "800",
              }}
            >
              خوش آمدید 👋
            </h1>

            <p
              style={{
                marginTop: "12px",
                marginBottom: 0,
                color: "#6b7280",
                fontSize: "15px",
                lineHeight: 1.9,
              }}
            >
              برای ادامه مسیر یادگیری وارد حساب
              کاربری خود شوید.
            </p>
          </div>

          {/* ======================================
              Email
          ====================================== */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "9px",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              ایمیل
            </label>

            <div
              style={{
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  fontSize: "18px",
                  opacity: 0.7,
                }}
              >
                ✉️
              </span>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="ایمیل خود را وارد کنید"
                autoComplete="email"
                style={{
                  width: "100%",
                  height: "54px",
                  boxSizing: "border-box",
                  border:
                    "1px solid #dbe2ea",
                  borderRadius: "14px",
                  padding:
                    "0 48px 0 16px",
                  fontSize: "14px",
                  color: "#111827",
                  background: "#f9fafb",
                  outline: "none",
                  direction: "rtl",
                  fontFamily:
                    "Tahoma, Arial, sans-serif",
                  transition:
                    "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1px solid #3b82f6";
                  e.currentTarget.style.background =
                    "#ffffff";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 4px rgba(59,130,246,0.10)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border =
                    "1px solid #dbe2ea";
                  e.currentTarget.style.background =
                    "#f9fafb";
                  e.currentTarget.style.boxShadow =
                    "none";
                }}
              />
            </div>
          </div>

          {/* ======================================
              Password
          ====================================== */}

          <div
            style={{
              marginBottom: "16px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "9px",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              رمز عبور
            </label>

            <div
              style={{
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  fontSize: "18px",
                  opacity: 0.7,
                }}
              >
                🔒
              </span>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="رمز عبور خود را وارد کنید"
                autoComplete="current-password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                style={{
                  width: "100%",
                  height: "54px",
                  boxSizing: "border-box",
                  border:
                    "1px solid #dbe2ea",
                  borderRadius: "14px",
                  padding:
                    "0 48px 0 52px",
                  fontSize: "14px",
                  color: "#111827",
                  background: "#f9fafb",
                  outline: "none",
                  direction: "rtl",
                  fontFamily:
                    "Tahoma, Arial, sans-serif",
                  transition:
                    "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1px solid #3b82f6";
                  e.currentTarget.style.background =
                    "#ffffff";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 4px rgba(59,130,246,0.10)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border =
                    "1px solid #dbe2ea";
                  e.currentTarget.style.background =
                    "#f9fafb";
                  e.currentTarget.style.boxShadow =
                    "none";
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "17px",
                  opacity: 0.7,
                  padding: "5px",
                }}
                title={
                  showPassword
                    ? "مخفی کردن رمز"
                    : "نمایش رمز"
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* ======================================
              Options
          ====================================== */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "24px",
              fontSize: "13px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                color: "#6b7280",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
              />

              مرا به خاطر بسپار
            </label>

            <button
              type="button"
              style={{
                border: "none",
                background: "transparent",
                color: "#2563eb",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily:
                  "Tahoma, Arial, sans-serif",
                padding: 0,
              }}
              onClick={() => {
                setError(
                  "بازیابی رمز عبور در نسخه بعدی فعال خواهد شد."
                );
              }}
            >
              رمز عبور را فراموش کرده‌اید؟
            </button>
          </div>

          {/* ======================================
              Error
          ====================================== */}

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border:
                  "1px solid #fecaca",
                color: "#b91c1c",
                borderRadius: "13px",
                padding: "12px 14px",
                marginBottom: "18px",
                fontSize: "13px",
                lineHeight: 1.8,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* ======================================
              Login button
          ====================================== */}

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              height: "55px",
              border: "none",
              borderRadius: "14px",
              background: loading
                ? "#93c5fd"
                : "linear-gradient(135deg, #2563eb, #4f46e5)",
              color: "white",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontFamily:
                "Tahoma, Arial, sans-serif",
              boxShadow: loading
                ? "none"
                : "0 10px 25px rgba(37,99,235,0.25)",
              transition:
                "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform =
                  "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 14px 30px rgba(37,99,235,0.32)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0)";
              e.currentTarget.style.boxShadow =
                loading
                  ? "none"
                  : "0 10px 25px rgba(37,99,235,0.25)";
            }}
          >
            {loading
              ? "⏳ در حال ورود..."
              : "ورود به MathVerse ←"}
          </button>

          {/* ======================================
              Divider
          ====================================== */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin:
                "28px 0 22px",
              color: "#9ca3af",
              fontSize: "12px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "#e5e7eb",
              }}
            />

            <span>
              ورود به مسیر یادگیری
            </span>

            <div
              style={{
                flex: 1,
                height: "1px",
                background: "#e5e7eb",
              }}
            />
          </div>

          {/* ======================================
              Register
          ====================================== */}

          <div
            style={{
              textAlign: "center",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            حساب کاربری ندارید؟

            <button
              type="button"
              onClick={() =>
                navigate("/register")
              }
              style={{
                border: "none",
                background: "transparent",
                color: "#2563eb",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px",
                fontFamily:
                  "Tahoma, Arial, sans-serif",
                marginRight: "7px",
                padding: 0,
              }}
            >
              ثبت‌نام کنید
            </button>
          </div>

          {/* ======================================
              Creator Signature
          ====================================== */}

          <div
            style={{
              marginTop: "22px",
              paddingTop: "18px",
              borderTop: "1px solid #f0f0f0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#9ca3af",
                marginBottom: "5px",
              }}
            >
              طراحی و توسعه
            </div>

            <div
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#374151",
                letterSpacing: "0.2px",
              }}
            >
              مهندس مجید زینال نژاد
            </div>
          </div>

          {/* Footer */}

          <div
            style={{
              textAlign: "center",
              marginTop: "28px",
              color: "#9ca3af",
              fontSize: "11px",
            }}
          >
            MathVerse • Smart Mathematics Learning
          </div>
        </section>
      </div>

      {/* ==========================================
          Responsive style
      ========================================== */}

      <style>
        {`
          @media (max-width: 850px) {
            main > div {
              grid-template-columns: 1fr !important;
              max-width: 520px !important;
            }

            main > div > section:first-child {
              display: none !important;
            }

            main > div > section:last-child {
              padding: 38px 28px !important;
              min-height: auto !important;
            }
          }

          @media (max-width: 480px) {
            main {
              padding: 15px !important;
            }

            main > div > section:last-child {
              padding: 30px 20px !important;
            }

            h1 {
              font-size: 27px !important;
            }
          }
        `}
      </style>
    </main>
  );
}
