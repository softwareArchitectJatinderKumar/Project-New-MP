import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { LpujournalbookService } from 'src/app/_services/lpujournalbook.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-journal-editor-board',
  templateUrl: './journal-editor-board.component.html',
  styleUrls: ['./journal-editor-board.component.scss']
})
export class JournalEditorBoardComponent implements OnInit {
 isEditMode = false;
  loadingData = false;
  BookId: any; name: any; editorData: any;
  EditorInChief: any;
  AssociateEditor: any; ManagingEditor: any; EditorialboardmembersNational: any;
  EditorialboardmembersReviews: any; EditorialboardmembersInterNational: any; LoadingData: boolean = false; filteredEditors: any;
  constructor(
    private journalWebApiService: LpujournalbookService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    let BookId = this.route.snapshot.params['Id'];
    let name = this.route.snapshot.params['name'];
    if (BookId != undefined && BookId != null) {
      this.BookId = BookId;
      this.name = name;
      this.GetJournalEditorsDetailsByBookId(BookId);
    } else {
      // swal.fire({
      //   icon: 'error',
      //   title: 'Oops...',
      //   text: 'Something went wrong!',
      //   confirmButtonColor: '#3085d6',
      //   confirmButtonText: 'Ok'
      // }).then((result) => {
      //   if (result.isConfirmed) {
      //     this.router.navigate(['/journalHome']);
      //   }
      // });
    }

  }

  GetJournalEditorsDetailsByBookId(BookId: any): void {
    this.journalWebApiService.GetAllJournalEditorsDetails().subscribe((response) => {
      if (response.item1 && response.item1.length > 0) {
        this.editorData = response.item1;
        this.filteredEditors = this.editorData.filter((item: { journalId: any }) => item.journalId === BookId);
        // console.log(JSON.stringify(this.filteredEditors))
        this.GetDataforEditors();
      }
      else {
        this.editorData = this.EditorInChief = this.AssociateEditor = this.ManagingEditor = this.EditorialboardmembersNational = this.EditorialboardmembersInterNational = this.EditorialboardmembersReviews = [];
      }

      if (this.editorData.length < 1) {
        this.LoadingData = true;
        this.router.navigateByUrl('/');
      }

    });
  }

  GetDataforEditors() {
    this.EditorInChief = this.filteredEditors.filter((item: { editorType: string; }) => item.editorType.toLowerCase().includes('editor in chief')); //
    this.AssociateEditor = this.filteredEditors.filter((item: { editorType: string; }) => item.editorType.toLowerCase().includes('associate editors'));
    this.ManagingEditor = this.filteredEditors.filter((item: { editorType: string; }) => item.editorType.toLowerCase().includes('managing editor'));
    this.EditorialboardmembersNational = this.filteredEditors.filter((item: { editorType: string; }) => item.editorType.toLowerCase().includes('editorial board members national'));
    this.EditorialboardmembersInterNational = this.filteredEditors.filter((item: { editorType: string; }) => item.editorType.toLowerCase().includes('editorial board members international'));
    this.EditorialboardmembersReviews = this.filteredEditors.filter((item: { editorType: string; }) => item.editorType.toLowerCase().includes('reviewers '));
  }


  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  async saveAll() {
    if (this.isEditMode) {
      const allEditorsData = {
        editorInChief: this.EditorInChief,
        managingEditors: this.ManagingEditor,
        associateEditors: this.AssociateEditor,
        nationalMembers: this.EditorialboardmembersNational,
        internationalMembers: this.EditorialboardmembersInterNational,
      };

      try {
        this.loadingData = true; // Optionally show a loading state
        // await this.journalWebApiService.saveEditors(allEditorsData);
        this.loadingData = false;
        this.isEditMode = false; // Exit edit mode after saving
      } catch (error) {
        console.error('Error saving editors:', error);
        this.loadingData = false; // Handle loading state on error
      }
    }
  }

}
