import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/app/lib/auth";
import AdminSidebar from "@/app/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const payload = verifyToken(token);

  if (!payload || !["admin", "super_admin"].includes(payload.role)) {
    // If they are logged in but not an admin, send them to their respective dashboard
    if (payload?.role === "candidate") redirect("/dashboard/candidate");
    if (payload?.role === "employer") redirect("/dashboard/employer");
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-[#F2F4F4]">
      {/* Sidebar - Desktop */}
      <aside className="w-72 bg-[#57595B] hidden lg:block fixed h-full z-50">
        <AdminSidebar adminUser={payload} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 relative">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
             style={{ 
               backgroundImage: "radial-gradient(circle, #57595B 0.5px, transparent 0.5px)", 
               backgroundSize: "32px 32px"
             }} />
        <div className="relative z-10 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
