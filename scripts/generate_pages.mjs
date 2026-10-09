import fs from 'fs';
import path from 'path';

const routes = {
  generator: [
    'dashboard',
    'schedule-pickup',
    'my-pickups',
    'fair-price-board',
    'impact',
    'payments',
    'profile',
    'help'
  ],
  picker: [
    'dashboard',
    'nearby-requests',
    'my-pickups',
    'route-planner',
    'earnings',
    'wallet',
    'profile',
    'help'
  ],
  admin: [
    'dashboard',
    'users',
    'pickups',
    'fairness-analytics',
    'disputes',
    'price-board',
    'impact-reports',
    'settings'
  ]
};

const baseDir = path.join(process.cwd(), 'app');

// Delete the old dashboard folder if it exists
const oldDashboard = path.join(baseDir, 'dashboard');
if (fs.existsSync(oldDashboard)) {
  fs.rmSync(oldDashboard, { recursive: true, force: true });
}

Object.keys(routes).forEach(role => {
  const roleDir = path.join(baseDir, role);
  if (!fs.existsSync(roleDir)) {
    fs.mkdirSync(roleDir, { recursive: true });
  }

  // Create layout.tsx for each role
  const layoutContent = `
import { ReactNode } from "react";
import SidebarLayout from "@/components/SidebarLayout";

export default function ${role.charAt(0).toUpperCase() + role.slice(1)}Layout({ children }: { children: ReactNode }) {
  return <SidebarLayout role="${role}">{children}</SidebarLayout>;
}
  `.trim();
  fs.writeFileSync(path.join(roleDir, 'layout.tsx'), layoutContent);

  // Create pages
  routes[role].forEach(route => {
    const routeDir = path.join(roleDir, route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    const componentName = route.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Page';
    const pageContent = `
export default function ${componentName}() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold capitalize">${route.replace(/-/g, ' ')}</h1>
      <p className="text-slate-500">Welcome to the ${route.replace(/-/g, ' ')} page.</p>
    </div>
  );
}
    `.trim();

    fs.writeFileSync(path.join(routeDir, 'page.tsx'), pageContent);
  });
});

console.log("Created all route groups and placeholder pages.");
