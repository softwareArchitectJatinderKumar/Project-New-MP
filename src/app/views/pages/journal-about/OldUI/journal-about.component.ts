// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-journal-about',
//   templateUrl: './journal-about.component.html',
//   styleUrls: ['./journal-about.component.scss']
// })
// export class JournalAboutComponent {

// }
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { LpujournalbookService } from 'src/app/_services/lpujournalbook.service';


interface Book {
  id: number;
  bookId: string;
  aboutBook: string; // Optional property
  bookPages: number;
  totalCopies: number;
  languages?: string;
  ratingPoint?: string;
  publisher?: string;
  publicationAddress?: string;
  comments?: string;
  issnNo?: string;
  regNo?: string;
  periodicity?: string;
  scope?: string;
  charges?: string; openAccess?: string;
  modeofAvailable?: string;
  review?: string;
  editorName?: string;
  editorDesignation?: string;
  createdBy?: string;
  editorCategory?: string;
  imagePath?: string;
}
@Component({
  selector: 'app-journal-about',
  templateUrl: './journal-about.component.html',
  styleUrls: ['./journal-about.component.scss']
})
export class JournalAboutComponent implements OnInit {
  data: any[] =[];
  BookId: any;
  bookData: any;

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
        this.GetJournalBookDetailsById(this.BookId);
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
  }


  GetJournalBookDetailsById(BookId: number): void {
    this.journalWebApiService.GetJournalBookDetailsById(BookId).subscribe((response) => {
      if (response.item1 && response.item1.length > 0) {
        this.bookData = response.item1[0];
      }
      else {
        this.bookData = [];
        this.router.navigateByUrl('/');
      }
      // console.log("Books Details " + JSON.stringify(this.bookData));
    });
  }
}
