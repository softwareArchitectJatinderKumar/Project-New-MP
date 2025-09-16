import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-parent-update',
  templateUrl: './parent-update.component.html',
  styleUrls: ['./parent-update.component.scss']
})
export class ParentUpdateComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    alert(1);
  }

}
