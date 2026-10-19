import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ClientDashboard from "@/components/dashboard/ClientDashboard";

// Страница кабинета клиента проверяет роль пользователя и направляет его в нужный кабинет.
const Dashboard = () => {
  const { user, loading, hasRole, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [checkingApproval, setCheckingApproval] = useState(true);

  // Неавторизованный пользователь не должен попадать в кабинет.
  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  // Redirect role-specific users to their dedicated routes
  useEffect(() => {
    if (loading || !user) return;
    if (hasRole("super_admin")) {
      navigate("/super-admin/dashboard", { replace: true });
      return;
    }
    if (hasRole("admin")) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
    if (hasRole("master")) {
      navigate("/master-dashboard", { replace: true });
      return;
    }
  }, [user, loading, hasRole, navigate]);

  // Check approval status for masters
  useEffect(() => {
    const check = async () => {
      if (!user) return;
      if (hasRole("master")) {
        try {
          const res: any = await Promise.race([
            supabase.from("profiles").select("approval_status").eq("user_id", user.id).single(),
            new Promise((resolve) => setTimeout(() => resolve({ data: null }), 6000)),
          ]);
          setApprovalStatus(res?.data?.approval_status || "active");
        } catch {
          setApprovalStatus("active");
        }
      } else {
        setApprovalStatus("active");
      }
      setCheckingApproval(false);
    };
    if (user && !loading) check();
  }, [user, loading, hasRole]);

  if (loading || checkingApproval) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-2xl bg-emerald-400/30 animate-ping" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-xl font-black text-white shadow-xl shadow-emerald-300/50">М</div>
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Загружаем кабинет…</p>
      </div>
    );
  }

  if (!user) return null;

  // Block pending masters
  if (hasRole("master") && approvalStatus === "pending") {
    navigate("/pending-approval");
    return null;
  }

  // Only clients reach here
  return <ClientDashboard />;
};

export default Dashboard;
