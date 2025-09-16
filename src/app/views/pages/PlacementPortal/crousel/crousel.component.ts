
import { PlacementPortalService } from 'src/app/_services/placement-portal.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {  FormBuilder } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { DataTable } from "simple-datatables";
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import * as XLSX from 'xlsx';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import swal from 'sweetalert2';
import { OwlCarouselComponent } from '../../advanced-ui/owl-carousel/owl-carousel.component';
import { OwlOptions } from 'ngx-owl-carousel-o';


@Component({
    selector: 'app-crousel',
    templateUrl: './crousel.component.html',
    //   styleUrl: './crousel.component.scss'
    styleUrls: ['./crousel.component.scss']
})
export class CrouselComponent implements OnInit {
    SelectedStudentDetails: any;
    errorMessage: any;
    isLoginFailed: boolean;
    slides: any;
    constructor(
        private placementPortalService: PlacementPortalService,
        private storageService: StorageService,
        private modalService: NgbModal, private authService: AuthService,
        public formBuilder: UntypedFormBuilder, private route: ActivatedRoute,
        private fb: FormBuilder
    
      ) { }
    
      ngOnInit(): void {
        this.GetSelectedStudentsDetails();
      }

      GetSelectedStudentsDetails(): void {
    
        this.placementPortalService.GetSelectedStudentsDetails().subscribe({
          next: response => {
            if (response.item1 && response.item1.length > 0) {
              this.slides = response.item1;
              console.log(" Selected Students Details " + JSON.stringify(this.slides))
            }
            else {
            }
          },
          error: err => {
            this.LoginFailed(err);
          }
        });
      }

      LoginFailed(NewError: any) {
        this.errorMessage = NewError.errorMessage;
        this.isLoginFailed = true;
        swal.fire({
          title: 'Login Failed',
          text: 'Login details are Invalid!',
          icon: 'warning',
        })
        const element = document.getElementById('myTabs');
        if (element) {
          element.hidden = true;
        }
      }
    
      autoPlayExampleOptions: OwlOptions = {
        items:4,
        loop:true,
        margin:10,
        autoplay:true,
        autoplayTimeout:7000,
        autoplayHoverPause:true,
        responsive:{
          0:{
              items:2
          },
          600:{
              items:3
          },
          1000:{
              items:4
          }
        }
      }
    
    // slides = [

    //     { img: "assets/tristy.gif", name: "Tristy Saha", reg: "11913789", sec: "K19GT", placed: "Amazon" },
    //     { img: "assets/rahul.gif", name: "Rahul", reg: "11910446", sec: "K18GT", placed: "Tata" },
    //     { img: "assets/vidushi.gif", name: "Vidushi", reg: "11917456", sec: "K29GT", placed: "Amazon" },
    //     { img: "assets/rohit.gif", name: "Rohit", reg: "11510456", sec: "K19ST", placed: "Google" },
    //     { img: "assets/nishant.gif", name: "Nishant", reg: "11910956", sec: "K19RT", placed: "Wipro" },
    //     { img: "assets/srijan.gif", name: "Srijan", reg: "11950456", sec: "K19GH", placed: "Jio" },
    //     { img: "assets/putti.gif", name: "Putti", reg: "11910486", sec: "K19kT", placed: "Oracle" },
    //     { img: "assets/harsh.gif", name: "Harsh", reg: "11918456", sec: "K19mT", placed: "Cognizent" },

    // ];
    slideConfig = {
        "slidesToShow": 2,
        "slidesToScroll": 2,
        "autoplay": true,
        "autoplaySpeed": 1000,
        "pauseOnHover": true,
        "infinite": true,
        "vertical": true,
        "responsive": [
            {
                "breakpoint": 992,
                "settings": {
                    "arrows": true,
                    "infinite": true,
                    "slidesToShow": 3,
                    "slidesToScroll": 3
                }
            },
            {
                "breakpoint": 756,
                "settings": {
                    "arrows": true,
                    "infinite": true,
                    "slidesToShow": 1,
                    "slidesToScroll": 1
                }
            }
        ]
    };

}
