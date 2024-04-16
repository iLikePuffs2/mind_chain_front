import Login from '../pages/Login';
import Flow from '../pages/Flow';
import Register from '../pages/Register';
import { RouteObject, useRoutes } from "react-router-dom";

const staticRoutes: RouteObject[] = [
  { path: '/login', element: <Login /> },
  { path: '/flow', element: <Flow /> },
  { path: '/register', element: <Register /> },
  // ...
];

export default function MyRouter() {
  const router = useRoutes(staticRoutes);
  return router;
}