export interface AdminMetrics {
  users: {
    total: number;
    creators: number;
    students: number;
  };
  courses: {
    total: number;
    published: number;
    pending: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
  };
  certificates: {
    total: number;
    issued: number;
  };
  revenue: {
    total: number;
    monthly: number;
  };
  pendingActions: {
    applications: number;
    courses: number;
  };
}

export default AdminMetrics;