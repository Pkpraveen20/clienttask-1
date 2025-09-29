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
import ProductTable from "../modules/global/productModule/productTable";
import TopicTable from "../modules/global/topicModule/topicTable";
import ContentTable from "../modules/global/contentModule/contentTable";
import ProductView from "../modules/global/productModule/productView";
import TopicView from "../modules/global/topicModule/topicView";
import ContentView from "../modules/global/contentModule/contentView";
import PermissionGroupTable from "../modules/clientSetting/permissiongroup/permissionGroupTable";
import PermissionGroupView from "../modules/clientSetting/permissiongroup/permissionGroupView";
import VendorTable from "../modules/clientSetting/vendor/vendorTable";
import VendorView from "../modules/clientSetting/vendor/vendorView";
import NotFoundPage from "../components/notFoundpage";
import ProfileTable from "../modules/clientSetting/profile/profileTable";
import ProfileForm from "../modules/clientSetting/profile/profileForm";

// import LoginPage from "../components/LoginPage";
// import SignUpPage from "../components/signup";
  
const rootRoute = createRootRoute({ component: App });

const notRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: NotFoundPage,
});

// const loginRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: "/login",
//   component: LoginPage,
// });
// const SignRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: "/signup",
//   component: SignUpPage,
// });

const clientRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/client",
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
const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/product",
  component: ProductTable,
});
const productViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/product/$id",
  component: ProductView,
});

const topicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/topic",
  component: TopicTable,
});
const topicViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/topic/$id",
  component: TopicView,
});
const contentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/content",
  component: ContentTable,
});
const contentViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/content/$id",
  component: ContentView,
});
const permissionGroupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/permissiongroup",
  component: PermissionGroupTable,
});
const permissionGroupViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/permissiongroup/$id",
  component: PermissionGroupView,
});
const vendorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vendor",
  component: VendorTable,
});
const vendorViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vendor/$id",
  component: VendorView,
});
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfileTable,
});
// const profileCreateRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: "/profilecreate",
//   component: ProfileForm,
// });

const routeTree = rootRoute.addChildren([
  clientRoute,
  roleRoute,
  functionalRoute,
  permissionRoute,
  engagementRoute,
  engagementViewRoute,
  productRoute,
  topicRoute,
  contentRoute,
  productViewRoute,
  topicViewRoute,
  contentViewRoute,
  notRoute,
  permissionGroupRoute,
  permissionGroupViewRoute,
  vendorRoute,
  vendorViewRoute,
  profileRoute,
  // profileCreateRoute,
  // loginRoute,
  // SignRoute,
]);

export const router = createRouter({ routeTree });
