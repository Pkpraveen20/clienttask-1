import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import App from "../App";
import ClientTable from "../modules/clientSetting/clients/clientTable";
import RoleTable from "../modules/clientSetting/roles/roleTable";
import EngagementTable from "../modules/enagementSetting/engagement/engagementTable";
import EngagementView from "../modules/enagementSetting/engagement/engagementView";
import FunctionalArea from "../modules/clientSetting/functionalAreas/functionalAreaTable";
import PermissionTable from "../modules/clientSetting/permission/permissionTable";

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
