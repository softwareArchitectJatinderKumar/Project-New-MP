import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BaseComponent } from './views/layout/base/base.component';
import { AuthGuard } from './core/guard/auth.guard';
import { ErrorPageComponent } from './views/pages/error-page/error-page.component';
import { EstateActionablePointCompleteTaskComponent } from './views/pages/estate-actionable-point-completetask/estate-actionable-point-completetask.component';
import { SemesterMigrationAdminComponent } from './views/SemesterExchange/HODDashboard/TopMenuBar/sm-admin-bar.component';
import { CriteriaMasterComponent } from './components/criteria-master/criteria-master.component';
// import { CriteriaMasterComponent } from './views/Criteria-Master/criteria-master.component';


const routes: Routes = [

  { path: 'auth', loadChildren: () => import('./views/pages/auth/auth.module').then(m => m.AuthModule) },
  {
    path: '',
    component: BaseComponent,
    canActivate: [AuthGuard],
    children: [

      {
        path: 'MetricTargets/:loginName',
        loadChildren: () => import('./views/Multiple-Metric-Dashboard/metric-targets.module').then(m => m.MetricTargetsModule),
      },
      {
        path: 'OBPAdminDashboard/:loginName',
        loadChildren: () => import('./views/OBPAdminDashboard/MasterDetailsPage.module').then(m => m.MasterDetailsPageModule),
      },
      {
        path: 'OBPMetricPABindings/:loginName',
        loadChildren: () => import('./views/HeadMappingInterface/HeadMappingWithAssistant/HeadMappingWithAssistant.module').then(m => m.OBPMetricBindingModule),
      },
      {
        path: 'OBPHeadMapping/:loginName',
        loadChildren: () => import('./views/HeadMappingInterface/HeadMappingWithAssistant/HeadMappingWithAssistant.module').then(m => m.OBPMetricBindingModule),
      },
      // Semester Exchange 
      {
        path: 'StaffLogin',
        loadChildren: () => import('./views/SemesterExchange/LoginPage/LoginPage.module').then(m => m.LoginPageNComponentModule),
      },
      { path: 'SMAdmin/:LoginName', redirectTo: 'FacultyDashboard/:LoginName', pathMatch: 'full' },
      // { path: 'newStudentPortal/:LoginName', redirectTo: 'newSemesterExchangeRegistration/:LoginName', pathMatch: 'full' },
      { path: 'DashboardDIAHOD/:LoginName', redirectTo: 'FacultyDashboard/:LoginName', pathMatch: 'full' },
      { path: 'DashboardHOW/:LoginName', redirectTo: 'FacultyDashboard/:LoginName', pathMatch: 'full' },
      { path: 'DashboardHOD/:LoginName', redirectTo: 'FacultyDashboard/:LoginName', pathMatch: 'full' },
      { path: 'stuPotal/:LoginName', redirectTo: 'NewWay-Register/:LoginName', pathMatch: 'full' },
      {
        path: 'FacultyDashboard/:LoginName',
        loadChildren: () => import('./views/SemesterExchange/DashboardFaculty/DealingDashboard.module').then(m => m.DynamicDashboardModule),
      },
      {
        path: 'NewWay-Register/:LoginName', // Registeration-Form/c085f2e914a7b87faaf04df70801c7de74cc7fa78fa89978e4c5279c35331d13f781301cbdd1b14bf6c9fbd5e0582291
        loadChildren: () => import('./views/SemesterExchange/StudentForm/Register-Form/RegisterForm.module').then(m => m.RegisterFormModule),
        // loadChildren: () => import('./views/SemesterExchange/StudentForm/NewLogic/NewLogicForm.module').then(m => m.NewLogicFormModule),
      },
      // {
      //   path: 'stuPotal/:LoginName',
      //   loadChildren: () => import('./views/SemesterExchange/StudentForm/StudentForm.module').then(m => m.StudentFormModule),
      //   // loadChildren: () => import('./views/SemesterExchange/StudentForm/NewLogic/NewLogicForm.module').then(m => m.NewLogicFormModule),
      // },
      {
        path: 'newSemesterExchangeRegistration/:LoginName',
        // loadChildren: () => import('./views/SemesterExchange/StudentForm/StudentForm.module').then(m => m.StudentFormModule),
        loadChildren: () => import('./views/SemesterExchange/StudentForm/NewLogic/NewLogicForm.module').then(m => m.NewLogicFormModule),
      },
      {
        path: 'StudentDashboard/:LoginName/:RegistrationNo',
        // loadChildren: () => import('./views/SemesterExchange/StudentDashboard/StudentDashboard.module').then(m => m.StudentDashboardModule),
        // loadChildren: () => import('./views/SemesterExchange/StudentDashboard/StudentDashboardwithTabs.module').then(m => m.StudentDashboardwithTabsModule),
        loadChildren: () => import('./views/SemesterExchange/StudentDashboard/Edit-Application/StudentForm.module').then(m => m.EditApplicationModule),
      },
      {
        path: 'SENextStep/:LoginName/:RegistrationNo',
        loadChildren: () => import('./views/SemesterExchange/StudentDashboard/StudentDashboardwithTabs.module').then(m => m.StudentDashboardwithTabsModule),
      },
      // {
      //   path: 'DashboardHOW/:LoginName',
      //   loadChildren: () => import('./views/SemesterExchange/HOWDashboard/HOWDashboard.module').then(m => m.HOWDashboardModule),
      // },
      // 6-Sep-25 Starts
      {
        path: 'HODAdminPanel/:loginName',
        component: SemesterMigrationAdminComponent
        // loadChildren: () => import('./views/SemesterExchange/HODDashboard/TopMenuBar/sm-admin-bar.module').then(m => m.SemesterMigrationAdminModule),
      },
      {
        path: 'ViewAllApplications/:LoginName',
        loadChildren: () => import('./views/SemesterExchange/HODDashboard/StudentApplications/sm-all-applications.module').then(m => m.SMAllApplicationsModule),
      },
      {
        path: 'AllUniversities',
        loadChildren: () => import('./views/SemesterExchange/HODDashboard/AllUniveristyDetails/sm-list-all-university.module').then(m => m.SmListAllUniversityComponentModule),
      },
      //6-sep-ends
      // {
      //   path: 'DashboardHOD/:LoginName',
      //   loadChildren: () => import('./views/SemesterExchange/HODDashboard/HODDashboard.module').then(m => m.HODDashboardModule),
      // },

      // {
      //   path: 'DashboardDIAHOD/:LoginName',
      //   loadChildren: () => import('./views/SemesterExchange/DealingUserDashboard/DealingUserDashboard.module').then(m => m.DealingUserDashboardModule),
      // },
      {
        path: 'ApplicationDetails/:LoginName/:RegistrationNo/:Role',
        loadChildren: () => import('./views/SemesterExchange/StudentApplicationDetails/StudentApplicationDetails.module').then(m => m.StudentApplicationDetailsModule),
      },

      // Added on 27-Feb-25
      {
        path: 'JournalAdmin/:loginName',
        loadChildren: () => import('./views/pages/NewJournal/NewJournal.module').then(m => m.NewJournalComponentModule)
      },
      {
        path: ':Id/:name/EditorialBoard',
        loadChildren: () => import('./views/pages/journal-editor-board/journal-editor-board.component.module').then(m => m.JournalEditorBoardComponentModule)
      },
      {
        path: ':Id/:name/About',
        loadChildren: () => import('./views/pages/journal-about/journal-about.component.mdoule').then(m => m.JournalAboutComponentModule)
      },
      {
        path: 'EventCalender/:loginName',
        loadChildren: () => import('./views/pages/content/content.module').then(m => m.ContentComponentModule)
      },
      {
        path: 'EventCalenderAdmin/:loginName',
        loadChildren: () => import('./views/pages/calenderAdmin/contentAdmin.module').then(m => m.ContentAdminComponentModule)
      },
      {
        path: 'summerSchool/:loginName',
        loadChildren: () => import('./views/pages/summer-school-web/summer-school-web.module').then(m => m.SummerSchoolModule)
      },
      {
        path: 'summerSchoolmaster/:loginName',
        loadChildren: () => import('./views/pages/summer-school-admin/summer-school-admin.module').then(m => m.SummerSchoolAdminModule)
      },
      // 
      {
        path: 'sgrc/:loginName',
        loadChildren: () => import('./views/pages/SGRC-Casess/SGRC-Casess.module').then(m => m.SGRCModule)
        // loadChildren:() => import('./views/pages/SGRC-Casess/NewWaySGRC/SGRC/SGRC-Cases.module').then(m=>m.SGRCModule)
      },
      {
        path: 'MoUApproval/:loginName',
        loadChildren: () => import('./views/pages/MoUApproval/MoUApproval.module').then(m => m.MoUApprovalModule)
      },
      {
        path: 'MouNewRequest/:loginName', // 23-sep-25 added newmouid , ExportExcel fixed
        loadChildren: () => import('./views/pages/mou-documents-uploads/mou-documents-uploads.module').then(m => m.MouDocumentsUploadsModule)
      }, //Bug sheet Point 2 Export to Excel is Working  18-March-25  SP pGetMouDocumentsUidWise

      // MOU APPROVALS From HOS OR HEAD
      {
        path: 'MouApprovals/:loginName', ////22-sep-25 added new mouid 1 // 23-sep-25 added newmouid , ExportExcel fixed
        loadChildren: () => import('./views/pages/mou-documents-report/mou-documents-report.module').then(m => m.MouDocumentsReportModule)
      }, // ok  sp pGetAllUploadedMOUDocuments  //Bug sheet Point 1 Export to Excel is Working   18-March-25

      // MOU ACtivity Action From HOS OR HEAD
      {
        path: 'MouActivityPlan/:loginName', // 7-march-25 //22-sep-25 added new mouid 2 // 23-sep-25 added newmouid , ExportExcel fixed
        loadChildren: () => import('./views/pages/MouActivityActionPlan/MouActivityActionPlan.module').then(m => m.MouActivityActionPlanModule)
      }, // ok  pGetMouDocumentsforApprovals (2) pGetAllActivitiesAssigned
      {
        path: 'MouActivityTakeAction/:loginName', // 7-march-25 //22-sep-25 added new mouid 3 // 23-sep-25 added newmouid , ExportExcel fixed
        loadChildren: () => import('./views/pages/MouActivityTakeAction/MouActivityTakeAction.module').then(m => m.MouActivityTakeActionModule)
      }, // ok SP pGetAllMouActivityPlanRequest  (2) pGetAllMouActivityActionTakenMaster
      {
        path: 'MouActivityApprovals/:loginName', //7-march-25 //22-sep-25 added new mouid  4 // 23-sep-25 added newmouid , ExportExcel fixed
        loadChildren: () => import('./views/pages/MouActivityApprovals/MouActivityApprovals.module').then(m => m.MouActivityApprovalsModule)
      }, // ok  SP pGetMouActivityActionTakenDetails
      {
        path: 'MouAdminAction/:loginName', // added newMouId on 22-sep-25 5 // 23-sep-25 added newmouid , ExportExcel fixed
        loadChildren: () => import('./views/pages/MouReportDateWise/MouReportDateWise.module').then(m => m.MouReportDateWiseComponentModule)
      },// new interface


      // {
      //   path: 'obpallocation-transfer-tool/:loginName',
      //  loadChildren: () =>import('./views/pages/obpallocation-transfer-tool/obpallocation-transfer-tool.module').then(m => m.ObpallocationTransferToolModule)
      // },
      // { path: 'MyOBPAutoPlanners/:loginName', 
      //   loadChildren:() => import('./views/pages/auto-assign-metric/auto-assign-metric.module').then(m=>m.AutoAssignMetricModule),
      // },
      // {
      //   path: 'AutoObp/:LoginName',
      //   loadChildren: () => import('./views/pages/auto-assign-metric/auto-assign-metric.module').then(m => m.AutoAssignMetricModule)
      // },
      // {
      //   path: 'RMSDistanceReport/:loginName',
      //   loadChildren: () => import('./views/pages/RMSDistanceReport/RMSDistanceReport.module').then(m => m.RMSDistanceReportComponentModule)
      // },
      // {
      //   path: 'completetask/:loginName',
      //   component: EstateActionablePointCompleteTaskComponent
      //   // loadChildren: ()=> import('./views/pages/estate-actionable-point-completetask/estate-actionable-point-completetask.module').then(m =>m.EstateActionablePointPointCompleteModule)
      // }, 
      // {
      //   path: 'estate-actionable-point/:loginName',
      //   loadChildren: () => import('./views/pages/estate-actionable-point/estate-actionable-point.module').then(m => m.EstateActionablePointModule),
      // },
      {
        path: "OBPProgress/:loginName",
        loadChildren: () => import('./views/pages/SchoolDivisions/metricand-planner-data/metricand-palnner-data.module').then(m => m.MetricandPlannerDataModule)
        //  component:MetricandPlannerDataComponent
      },
       { path: 'criteria-master/:loginName', component: CriteriaMasterComponent },
      // {
      //   path: "UserOBPProgress/:loginName/:uid/:date",
      //   loadChildren: () => import('./views/pages/SchoolDivisions/metricand-planner-data/metricand-palnner-data.module').then(m => m.MetricandPlannerDataModule)
      // },
      // {
      //   // path: 'dashboard',
      //   path: 'dashboard/:uid',
      //   loadChildren: () => import('./views/pages/dashboard/dashboard.module').then(m => m.DashboardModule)
      // },
      // {
      //   path: 'placementdrive/:loginName',
      //   loadChildren: () => import('./views/pages/placement-drive/placement-drive.module').then(m => m.PlacementDriveModule)
      // },
      // {
      //   path: 'planningreport/:loginName',
      //   loadChildren: () => import('./views/pages/planning-report/planning-report.module').then(m => m.PlanningReportModule)
      // },
      // {
      //   path: 'placementdrivehodapproval/:loginName',
      //   loadChildren: () => import('./views/pages/placement-drive-hodapproval/placement-drive-hodapproval.module').then(m => m.PlacementDriveHODApprovalModule)
      // },
      // {
      //   path: 'rmsdashboard/:loginName',
      //   loadChildren: () => import('./views/pages/rms-dashboard/rms-dashboard.module').then(m => m.RMSDashboardModule)
      // },
      // {
      //   path: 'moudashboard/:loginName',
      //   loadChildren: () => import('./views/pages/moudashboard/moudashboard.module').then(m => m.MOUDashboardModule)
      // },
      // {
      //   path: 'AgreementEntry/:loginName',
      //   loadChildren: () => import('./views/pages/AgreementEntry/AgreementEntry.module').then(m => m.AgreementEntryModule)
      // },
      // {
      //   path: 'rms-log/:loginName',
      //   loadChildren: () => import('./views/pages/rms-log/rms-log.module').then(m => m.RMSLogModule)
      // },
      // {
      //   path: 'activityplan/:loginName',
      //   loadChildren: () => import('./views/pages/activity-plan/activity-plan.module').then(m => m.AgreementActivityModule)
      // },
      // {
      //   path: 'rmspendancy/:loginName',
      //   loadChildren: () => import('./views/pages/rms-pendeancy/rms-pendeancy.module').then(m => m.RMSPendeancyModule)
      // },

      // {
      //   path: 'careerservices/:loginName',
      //   loadChildren: () => import('./views/pages/CareerServices/CareerServices.module').then(m => m.CareerservicesModule)
      // },
      // {
      //   path: 'moudashboardmobile',
      //   loadChildren: () => import('./views/pages/moudashboardmobile/moudashboardmobile.module').then(m => m.MOUDashboardMobileModule)
      // },
      // {
      //   path: 'ConstructionRMS',
      //   loadChildren: () => import('./views/pages/ConstructionRMS/ConstructionRMS.module').then(m => m.ConstructionRMSModule)
      // },
      // {
      //   path: 'apps',
      //   loadChildren: () => import('./views/pages/apps/apps.module').then(m => m.AppsModule)
      // },
      // {
      //   path: 'ui-components',
      //   loadChildren: () => import('./views/pages/ui-components/ui-components.module').then(m => m.UiComponentsModule)
      // },
      // {
      //   path: 'advanced-ui',
      //   loadChildren: () => import('./views/pages/advanced-ui/advanced-ui.module').then(m => m.AdvancedUiModule)
      // },
      // {
      //   path: 'form-elements',
      //   loadChildren: () => import('./views/pages/form-elements/form-elements.module').then(m => m.FormElementsModule)
      // },
      // {
      //   path: 'advanced-form-elements',
      //   loadChildren: () => import('./views/pages/advanced-form-elements/advanced-form-elements.module').then(m => m.AdvancedFormElementsModule)
      // },
      // {
      //   path: 'charts-graphs',
      //   loadChildren: () => import('./views/pages/charts-graphs/charts-graphs.module').then(m => m.ChartsGraphsModule)
      // },
      // {
      //   path: 'tables',
      //   loadChildren: () => import('./views/pages/tables/tables.module').then(m => m.TablesModule)
      // },
      // {
      //   path: 'icons',
      //   loadChildren: () => import('./views/pages/icons/icons.module').then(m => m.IconsModule)
      // },
      // {
      //   path: 'general',
      //   loadChildren: () => import('./views/pages/general/general.module').then(m => m.GeneralModule)
      // },
      // {
      //   path: 'alumni-relation/:loginName',
      //   loadChildren: () => import('./views/pages/alumni-relation/alumni-relation.module').then(m => m.AlumniRelationModule)
      // },
      // {
      //   path: 'parent-update/:loginName',
      //   loadChildren: () => import('./views/pages/parent-update/parent-update.module').then(m => m.ParentUpdateModule)
      // },
      // {
      //   path: 'planner-score-ranking/:loginName',
      //   loadChildren: () => import('./views/pages/planner-score-ranking/planner-score-ranking.module').then(m => m.PlanningScoreRankingModule)
      // },
      // {
      //   path: 'administrative-report/:loginName',
      //   loadChildren: () => import('./views/pages/administrative-report/administrative-report.module').then(m => m.AdministrativeReportModule)
      // },

      // {
      //   path: 'RMSTelephonicDSR/:loginName',
      //   loadChildren: () => import('./views/pages/rmstelephonic-dsr/rmstelephonic-dsr.module').then(m => m.RMSTelephonicDSRModule)
      // },

      // {
      //   path:'ModifyJournal',
      //   loadChildren:()=> import('./views/pages/EditJournal/EditJournal.module').then(m=> m.EditJournalComponentModule)
      // },
      // {
      //   path:'journalXX',
      //   loadChildren:()=> import('./views/pages/NewJournal/NewJournal.module').then(m=> m.NewJournalComponentModule)
      // },
      // {
      //   path:'InstrumentXX',
      //   loadChildren:()=> import('./views/pages/NewCifInstrument/NewCifInstrument.module').then(m=> m.NewCifInstrumentComponentModule)
      // },
      // {
      //   path:'journalXX/:loginName',
      //   loadChildren:()=> import('./views/pages/NewJournal/NewJournal.module').then(m=> m.NewJournalComponentModule)
      // },
      // {
      //   path: 'rmsqr/:loginName',
      //   loadChildren: () => import('./views/pages/rms-scanner/rms-scanner.module').then(m => m.RMSScannerComponentModule)
      // },

      // {
      //   path: 'mounewreq/:loginName',
      //   loadChildren: () => import('./views/pages/mou-documents-uploads/mou-documents-uploads.module').then(m => m.MouDocumentsUploadsModule)
      // },


      // {
      //   path: 'RMSDSRRatingReport/:loginName',
      //   loadChildren: () => import('./views/pages/RMSDSRRatingReport/RMSDSRRatingReport.module').then(m => m.RMSDSRRatingReportComponentModule)
      // },
      // {
      //   path: 'RMSDealingReport/:loginName',
      //   loadChildren: () => import('./views/pages/RMSDealingOfficialReport/RMSDealingOfficialReport.module').then(m => m.RMSDealingOfficialReportComponentModule)
      // },
      // {
      //   path: 'RMSTelephonicDSR/:loginName',
      //   loadChildren: () => import('./views/pages/rmstelephonic-dsr/rmstelephonic-dsr.module').then(m => m.RMSTelephonicDSRModule)
      // },


      // {
      //   path: 'OBPStageWiseAdmin/:loginName',
      //   loadChildren: () => import('./views/pages/StageWiseConsrtuctionDashboard/StageWiseConsrtuctionDashboard.module').then(m => m.StageWiseConsrtuctionDashboardModule)
      // },
      //21/06/2025
      //  {
      //   path:'OBPEstatefinalVerfciation/:loginName',
      //   loadChildren:()=> import('./views/pages/obpestatefinal-verfication/obpestatefinal-verfication.module').then(m=> m.OBPEstatefinalVerficationModule)
      // } ,


      // {
      //   path:'AllAppointments/:loginName',
      //   loadChildren:()=> import('./views/pages/OutReach-Appointments/ViewAll-Appointments/ViewAll-appointments.module').then(m=> m.ViewAllAppointmentsModule)
      // },

      // {
      //   path:'CriteriaMaster',
      //   component: CriteriaMasterComponent
      //   // loadChildren:()=> import('./views/pages/UMS-Angular/CriteriaMaster/criteria-master.module').then(m=> m.CriteriaMasterModule)
      // },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      // { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'error',
    component: ErrorPageComponent,
    data: {
      'type': 404,
      'title': 'Page Not Found',
      'desc': 'Oopps!! The page you were looking for doesn\'t exist.'
    }
  },
  {
    path: 'error/:type',
    component: ErrorPageComponent
  },
  { path: '**', redirectTo: 'error', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
