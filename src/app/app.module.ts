import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { LayoutModule } from './views/layout/layout.module';
import { AuthGuard } from './core/guard/auth.guard';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { ErrorPageComponent } from './views/pages/error-page/error-page.component';

import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { httpInterceptorProviders } from './_helpers/http.interceptor';

import { MatDialogModule } from '@angular/material/dialog';
import { SucessDialogModule } from './dialog/sucess-dialog/sucess-dialog.module';
import { MaterialModule } from 'src/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ArchwizardModule } from 'angular-archwizard';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SummerSchoolWebComponent } from './views/pages/summer-school-web/summer-school-web.component';
import { SummerSchoolAdminComponent } from './views/pages/summer-school-admin/summer-school-admin.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AdministrativeReportComponent } from './views/pages/administrative-report/administrative-report.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MouDocumentsUploadsComponent } from './views/pages/mou-documents-uploads/mou-documents-uploads.component';
import { MouDocumentsReportComponent } from './views/pages/mou-documents-report/mou-documents-report.component';
import { StudentFormComponent } from './views/SemesterExchange/StudentForm/StudentForm.component';
// import { OBPEstatefinalVerficationComponent } from './views/pages/obpestatefinal-verfication/obpestatefinal-verfication.component';

@NgModule({
  declarations: [
    AppComponent,
    ErrorPageComponent,
    SummerSchoolWebComponent,
    SummerSchoolAdminComponent,
    AdministrativeReportComponent, 
    StudentFormComponent,
    // OBPEstatefinalVerficationComponent
  ],
  imports: [
    
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatDialogModule,
    HttpClientModule,
    SucessDialogModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    ArchwizardModule,
    MaterialModule,
    NgxDatatableModule,
    NgxSpinnerModule,
    MatSelectModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
   //ArchwizardModule,
    MaterialModule,
    NgxDatatableModule,
    MatTabsModule,
    MatDatepickerModule,
    MatTabsModule,
    MatNativeDateModule,
  ],
  providers: [
    
    httpInterceptorProviders,
    AuthGuard,
    {
      provide: HIGHLIGHT_OPTIONS, // https://www.npmjs.com/package/ngx-highlightjs
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          xml: () => import('highlight.js/lib/languages/xml'),
          typescript: () => import('highlight.js/lib/languages/typescript'),
          scss: () => import('highlight.js/lib/languages/scss'),
        }
      }
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
