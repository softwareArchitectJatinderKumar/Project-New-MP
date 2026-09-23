import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PlacementService } from 'src/app/_services/placement.service';
import { ColumnMode } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-placement-drive-candidates-modal',
  templateUrl: './placement-drive-candidates-modal.component.html',
  styleUrls: ['./placement-drive-candidates-modal.component.scss']
})
export class PlacementDriveCandidatesModalComponent implements OnInit {
  @Input() driveId!: any;
  @Input() type!: string;

  candidates: any[] = [];
  loadingIndicator: boolean = false;
  ColumnMode = ColumnMode;
  columns: any[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private placementService: PlacementService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  formatColumnName(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').trim();
  }

  loadData(): void {
    this.loadingIndicator = true;
    this.placementService.GetPlacementDriveCandidates(this.type, this.driveId).subscribe({
      next: (res) => {
        this.loadingIndicator = false;
        // In case the API returns { value: [...] } or just an array
        if (res && res.item1) {
          this.candidates = res.item1;
          // Inside your API success handler:

          if (this.candidates && this.candidates.length > 0) {
            this.columns = Object.keys(this.candidates[0]).map(key => {
              return {
                prop: key,
                name: this.formatColumnName(key) // Optional: Adds spaces before capital letters
              };
            });
          }
        } else if (Array.isArray(res)) {
          this.candidates = res;
        } else if (res && Array.isArray(res.data)) {
          this.candidates = res.data;
        } else {
          this.candidates = res || [];
        }
      },
      error: (err) => {
        this.loadingIndicator = false;
        console.error('Failed to load candidates:', err);
      }
    });
  }

  getModalTitle(): string {
    switch (this.type) {
      case 'A': return 'Eligible Candidates';
      case 'R': return 'Registered Candidates';
      case 'P': return 'Participated Candidates';
      case 'S': return 'Placed Candidates';
      default: return 'Candidates';
    }
  }
}
