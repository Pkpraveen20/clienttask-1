import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import App from "../App";
import ClientTable from "../modules/clients/clientTable";
import RoleTable from "../modules/roles/roleTable";
import FunctionalArea from "../modules/functionalAreas/functionalAreaTable";
import PermissionTable from "../modules/permission/permissionTable";
import EngagementTable from "../modules/engagement/engagementTable";
import EngagementView from "../modules/engagement/engagementView";

const rootRoute = createRootRoute({ component: App });

const clientRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ClientTable,
});
const functionalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/functional-areas",
  component: FunctionalArea,
});
const roleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/roles",
  component: RoleTable,
});
const permissionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/permissions",
  component: PermissionTable,
});

const engagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/engagements",
  component: EngagementTable,
});

const engagementViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/engagements/$id",
  component: EngagementView,
});

const routeTree = rootRoute.addChildren([
  clientRoute,
  roleRoute,
  functionalRoute,
  permissionRoute,
  engagementRoute,
  engagementViewRoute,
]);

export const router = createRouter({ routeTree });
