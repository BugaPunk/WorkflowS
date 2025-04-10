// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $about from "./routes/about.tsx";
import * as $admin_index from "./routes/admin/index.tsx";
import * as $admin_users from "./routes/admin/users.tsx";
import * as $api_admin_users from "./routes/api/admin/users.ts";
import * as $api_admin_users_delete from "./routes/api/admin/users/delete.ts";
import * as $api_login from "./routes/api/login.ts";
import * as $api_projects_index from "./routes/api/projects/index.ts";
import * as $api_projects_members from "./routes/api/projects/members.ts";
import * as $api_register from "./routes/api/register.ts";
import * as $api_session from "./routes/api/session.ts";
import * as $api_user_stories from "./routes/api/user-stories.ts";
import * as $api_user_stories_id_ from "./routes/api/user-stories/[id].ts";
import * as $backlog_index from "./routes/backlog/index.tsx";
import * as $index from "./routes/index.tsx";
import * as $login from "./routes/login.tsx";
import * as $logout from "./routes/logout.ts";
import * as $projects_id_ from "./routes/projects/[id].tsx";
import * as $projects_index from "./routes/projects/index.tsx";
import * as $register from "./routes/register.tsx";
import * as $unauthorized from "./routes/unauthorized.tsx";
import * as $user_stories_id_ from "./routes/user-stories/[id].tsx";
import * as $user_stories_index from "./routes/user-stories/index.tsx";
import * as $welcome from "./routes/welcome.tsx";
import * as $AdminCreateUserForm from "./islands/AdminCreateUserForm.tsx";
import * as $AdminUsersList from "./islands/AdminUsersList.tsx";
import * as $AdminWelcomeOptions from "./islands/AdminWelcomeOptions.tsx";
import * as $AssignProjectForm from "./islands/AssignProjectForm.tsx";
import * as $Backlog_BacklogFilters from "./islands/Backlog/BacklogFilters.tsx";
import * as $Backlog_BacklogHeader from "./islands/Backlog/BacklogHeader.tsx";
import * as $Backlog_BacklogItemCard from "./islands/Backlog/BacklogItemCard.tsx";
import * as $Backlog_BacklogMetrics from "./islands/Backlog/BacklogMetrics.tsx";
import * as $Backlog_ProductBacklog from "./islands/Backlog/ProductBacklog.tsx";
import * as $CommonWelcomeOptions from "./islands/CommonWelcomeOptions.tsx";
import * as $CreateProjectForm from "./islands/CreateProjectForm.tsx";
import * as $DeleteProjectModal from "./islands/DeleteProjectModal.tsx";
import * as $DropdownMenu from "./islands/DropdownMenu.tsx";
import * as $EditProjectForm from "./islands/EditProjectForm.tsx";
import * as $EmptyProjectsMessage from "./islands/EmptyProjectsMessage.tsx";
import * as $HeaderMenu from "./islands/HeaderMenu.tsx";
import * as $HeaderNav from "./islands/HeaderNav.tsx";
import * as $LoginForm from "./islands/LoginForm.tsx";
import * as $LogoutButton from "./islands/LogoutButton.tsx";
import * as $Modal from "./islands/Modal.tsx";
import * as $ProductOwnerWelcomeOptions from "./islands/ProductOwnerWelcomeOptions.tsx";
import * as $ProjectCard from "./islands/ProjectCard.tsx";
import * as $ProjectModals_AssignProjectModal from "./islands/ProjectModals/AssignProjectModal.tsx";
import * as $ProjectModals_CreateProjectModal from "./islands/ProjectModals/CreateProjectModal.tsx";
import * as $ProjectModals_EditProjectModal from "./islands/ProjectModals/EditProjectModal.tsx";
import * as $ProjectsHeader from "./islands/ProjectsHeader.tsx";
import * as $ProjectsList from "./islands/ProjectsList.tsx";
import * as $ProjectsStatusBar from "./islands/ProjectsStatusBar.tsx";
import * as $RegisterForm from "./islands/RegisterForm.tsx";
import * as $ScrumMasterWelcomeOptions from "./islands/ScrumMasterWelcomeOptions.tsx";
import * as $TeamDeveloperWelcomeOptions from "./islands/TeamDeveloperWelcomeOptions.tsx";
import * as $UserInfoCard from "./islands/UserInfoCard.tsx";
import * as $UserStories_CreateUserStoryForm from "./islands/UserStories/CreateUserStoryForm.tsx";
import * as $UserStories_EditUserStoryForm from "./islands/UserStories/EditUserStoryForm.tsx";
import * as $UserStories_UserStoriesList from "./islands/UserStories/UserStoriesList.tsx";
import * as $UserStories_UserStoryCard from "./islands/UserStories/UserStoryCard.tsx";
import * as $WelcomeHeader from "./islands/WelcomeHeader.tsx";
import * as $WelcomeScreen from "./islands/WelcomeScreen.tsx";
import type { Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/about.tsx": $about,
    "./routes/admin/index.tsx": $admin_index,
    "./routes/admin/users.tsx": $admin_users,
    "./routes/api/admin/users.ts": $api_admin_users,
    "./routes/api/admin/users/delete.ts": $api_admin_users_delete,
    "./routes/api/login.ts": $api_login,
    "./routes/api/projects/index.ts": $api_projects_index,
    "./routes/api/projects/members.ts": $api_projects_members,
    "./routes/api/register.ts": $api_register,
    "./routes/api/session.ts": $api_session,
    "./routes/api/user-stories.ts": $api_user_stories,
    "./routes/api/user-stories/[id].ts": $api_user_stories_id_,
    "./routes/backlog/index.tsx": $backlog_index,
    "./routes/index.tsx": $index,
    "./routes/login.tsx": $login,
    "./routes/logout.ts": $logout,
    "./routes/projects/[id].tsx": $projects_id_,
    "./routes/projects/index.tsx": $projects_index,
    "./routes/register.tsx": $register,
    "./routes/unauthorized.tsx": $unauthorized,
    "./routes/user-stories/[id].tsx": $user_stories_id_,
    "./routes/user-stories/index.tsx": $user_stories_index,
    "./routes/welcome.tsx": $welcome,
  },
  islands: {
    "./islands/AdminCreateUserForm.tsx": $AdminCreateUserForm,
    "./islands/AdminUsersList.tsx": $AdminUsersList,
    "./islands/AdminWelcomeOptions.tsx": $AdminWelcomeOptions,
    "./islands/AssignProjectForm.tsx": $AssignProjectForm,
    "./islands/Backlog/BacklogFilters.tsx": $Backlog_BacklogFilters,
    "./islands/Backlog/BacklogHeader.tsx": $Backlog_BacklogHeader,
    "./islands/Backlog/BacklogItemCard.tsx": $Backlog_BacklogItemCard,
    "./islands/Backlog/BacklogMetrics.tsx": $Backlog_BacklogMetrics,
    "./islands/Backlog/ProductBacklog.tsx": $Backlog_ProductBacklog,
    "./islands/CommonWelcomeOptions.tsx": $CommonWelcomeOptions,
    "./islands/CreateProjectForm.tsx": $CreateProjectForm,
    "./islands/DeleteProjectModal.tsx": $DeleteProjectModal,
    "./islands/DropdownMenu.tsx": $DropdownMenu,
    "./islands/EditProjectForm.tsx": $EditProjectForm,
    "./islands/EmptyProjectsMessage.tsx": $EmptyProjectsMessage,
    "./islands/HeaderMenu.tsx": $HeaderMenu,
    "./islands/HeaderNav.tsx": $HeaderNav,
    "./islands/LoginForm.tsx": $LoginForm,
    "./islands/LogoutButton.tsx": $LogoutButton,
    "./islands/Modal.tsx": $Modal,
    "./islands/ProductOwnerWelcomeOptions.tsx": $ProductOwnerWelcomeOptions,
    "./islands/ProjectCard.tsx": $ProjectCard,
    "./islands/ProjectModals/AssignProjectModal.tsx":
      $ProjectModals_AssignProjectModal,
    "./islands/ProjectModals/CreateProjectModal.tsx":
      $ProjectModals_CreateProjectModal,
    "./islands/ProjectModals/EditProjectModal.tsx":
      $ProjectModals_EditProjectModal,
    "./islands/ProjectsHeader.tsx": $ProjectsHeader,
    "./islands/ProjectsList.tsx": $ProjectsList,
    "./islands/ProjectsStatusBar.tsx": $ProjectsStatusBar,
    "./islands/RegisterForm.tsx": $RegisterForm,
    "./islands/ScrumMasterWelcomeOptions.tsx": $ScrumMasterWelcomeOptions,
    "./islands/TeamDeveloperWelcomeOptions.tsx": $TeamDeveloperWelcomeOptions,
    "./islands/UserInfoCard.tsx": $UserInfoCard,
    "./islands/UserStories/CreateUserStoryForm.tsx":
      $UserStories_CreateUserStoryForm,
    "./islands/UserStories/EditUserStoryForm.tsx":
      $UserStories_EditUserStoryForm,
    "./islands/UserStories/UserStoriesList.tsx": $UserStories_UserStoriesList,
    "./islands/UserStories/UserStoryCard.tsx": $UserStories_UserStoryCard,
    "./islands/WelcomeHeader.tsx": $WelcomeHeader,
    "./islands/WelcomeScreen.tsx": $WelcomeScreen,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
