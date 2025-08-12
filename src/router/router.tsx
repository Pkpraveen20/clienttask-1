import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import App from '../App';
import ClientTable from '../modules/clients/clientTable';
import RoleTable from '../modules/roles/roleTable';
import FunctionalArea from '../modules/functionalAreas/functionalAreaTable';
import PermissionTable from '../modules/permission/permissionTable';

const rootRoute = createRootRoute({ component: App });

const clientRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ClientTable,
});
const functionalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/functional-areas',
  component: FunctionalArea,
});
const roleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/roles',
  component: RoleTable,
});
const permissionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/permissions',
  component: PermissionTable,
});


const routeTree = rootRoute.addChildren([clientRoute,roleRoute,functionalRoute,permissionRoute]);

export const router = createRouter({ routeTree });
