import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { LpujournalbookService } from 'src/app/_services/lpujournalbook.service';
// import swal from 'sweetalert2';

@Component({
  selector: 'app-journal-editor-board',
  templateUrl: './journal-editor-board.component.html',
  styleUrls: ['./journal-editor-board.component.scss']
})
export class JournalEditorBoardComponent implements OnInit {
  BookId: any; name: any;
  editorData: any;
  EditorInChief: any;
  AssociateEditor: any;
  ManagingEditor: any;
  EditorialboardmembersNational: any;
  EditorialboardmembersReviews: any;
  EditorialboardmembersInterNational: any;
  LoadingData: boolean = false;

  constructor(
    private journalWebApiService: LpujournalbookService, private route: ActivatedRoute, private router: Router) { }



  ngOnInit(): void {
    
    let BookId  = this.route.snapshot.params['BookId'];
    let name  = this.route.snapshot.params['name'];
    //this.route.queryParams.subscribe(params => {
      // const BookId = params['BookId'];
      // const name = params['name'];
      // console.log("Value of Book Id = " + BookId)
      if (BookId != undefined && BookId != null) {
        this.BookId = BookId;
        this.name=name;
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
   // })

    // this.route.queryParams.subscribe(params => {
    //   const BookId = params['BookId'];
    //   console.log("Value of Book Id = " + BookId)
    //   if (BookId && BookId.length >= 1) {
    //     this.GetJournalEditorsDetailsByBookId(BookId);
    //   } else {
    //     swal.fire({
    //       icon: 'error',
    //       title: 'Oops...',
    //       text: 'Something went wrong!',
    //       confirmButtonColor: '#3085d6',
    //       confirmButtonText: 'Ok'
    //     }).then((result) => {
    //       if (result.isConfirmed) {
    //         this.router.navigate(['/journalHome']);
    //       }
    //     });
    //   }
    // })
  }

  GetJournalEditorsDetailsByBookId(BookId: number): void {
    this.journalWebApiService.GetJournalEditorsDetailsByBookId(BookId).subscribe((response) => {
      if (response.item1 && response.item1.length > 0) {
        this.editorData = response.item1;
        this.EditorInChief = this.editorData.filter((item: { editorCategory: string; }) => item.editorCategory.toLowerCase().includes('editor in chief'));
        this.AssociateEditor = this.editorData.filter((item: { editorCategory: string; }) => item.editorCategory.toLowerCase().includes('associate editor'));
        this.ManagingEditor = this.editorData.filter((item: { editorCategory: string; }) => item.editorCategory.toLowerCase().includes('managing editor'));
        this.EditorialboardmembersNational = this.editorData.filter((item: { editorCategory: string; }) => item.editorCategory.toLowerCase().includes('editorial board members national'));
        this.EditorialboardmembersInterNational = this.editorData.filter((item: { editorCategory: string; }) => item.editorCategory.toLowerCase().includes('editorial board members international'));
        this.EditorialboardmembersReviews = this.editorData.filter((item: { editorCategory: string; }) => item.editorCategory.toLowerCase().includes('reviewers'));
      }
      else {
        this.editorData =  this.EditorInChief = this.AssociateEditor =  this.ManagingEditor =this.EditorialboardmembersNational = this.EditorialboardmembersInterNational = this.EditorialboardmembersReviews =[];
      }

      if(this.editorData.length < 1 )
        {
          this.LoadingData= true;
          this.router.navigateByUrl('/');
        }
      // console.log("Books Details " + JSON.stringify(this.editorData));
      // console.log("EditorInChief " + JSON.stringify(this.EditorInChief));
      // console.log("AssociateEditor " + JSON.stringify(this.AssociateEditor));
      // console.log("ManagingEditor " + JSON.stringify(this.ManagingEditor));
      // console.log("EditorialboardmembersNational " + JSON.stringify(this.EditorialboardmembersNational));
    });
  }
}
